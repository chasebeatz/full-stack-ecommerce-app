import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import { randomUUID } from "crypto";
import { supabase, BUCKET } from "./lib/supabase.js";
import { requireAdmin } from "./lib/auth.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

// Keep files in memory and stream them to Supabase Storage.
// Vercel caps request bodies at 4.5 MB, so stay under that.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed")),
});

const CATEGORIES = ["men", "women", "kid"];

app.get("/", (req, res) => {
  res.send("Shoppee API is running");
});

app.post("/upload", requireAdmin, upload.single("product"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: 0, message: "No image provided" });

    const ext = path.extname(req.file.originalname).toLowerCase() || ".png";
    const objectPath = `products/${Date.now()}_${randomUUID()}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, req.file.buffer, { contentType: req.file.mimetype });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    res.json({ success: 1, image_url: data.publicUrl });
  } catch (err) {
    next(err);
  }
});

app.post("/addproducts", requireAdmin, async (req, res, next) => {
  try {
    const { name, image, category } = req.body;
    const new_price = Number(req.body.new_price);
    const old_price = Number(req.body.old_price);

    if (!name?.trim() || !image || !CATEGORIES.includes(category) || !(new_price >= 0) || !(old_price >= 0)) {
      return res.status(400).json({ success: false, message: "Invalid product data" });
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ name: name.trim(), image, category, new_price, old_price })
      .select()
      .single();
    if (error) throw error;

    res.json({ success: true, name: data.name, product: data, message: "Product added successfully" });
  } catch (err) {
    next(err);
  }
});

app.post("/removeproducts", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.body.id);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const { data, error } = await supabase.from("products").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Product not found" });

    // Best effort: also delete the image if it lives in our bucket.
    const marker = `/object/public/${BUCKET}/`;
    const idx = data.image?.indexOf(marker) ?? -1;
    if (idx !== -1) {
      await supabase.storage.from(BUCKET).remove([data.image.slice(idx + marker.length)]);
    }

    res.json({ success: true, name: data.name, message: "Product removed successfully" });
  } catch (err) {
    next(err);
  }
});

app.get("/allproducts", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.use("/auth", authRoutes);
app.use(orderRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({ success: false, message: err.message || "Server error" });
});

export default app;
