import { useEffect, useState } from "react";
import { Link } from "react-router";
import { HiOutlinePhotograph, HiOutlinePlus, HiCheckCircle, HiExclamationCircle, HiX } from "react-icons/hi";
import { addProduct, formatPrice, uploadImage } from "../lib/api";

const EMPTY = { name: "", old_price: "", new_price: "", category: "women" };

export default function AddProduct() {
  const [product, setProduct] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    if (!image) return setPreview("");
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleChange = (e) => setProduct((p) => ({ ...p, [e.target.name]: e.target.value }));

  const pickFile = (file) => {
    if (file && file.type.startsWith("image/")) setImage(file);
  };

  const oldPrice = Number(product.old_price);
  const newPrice = Number(product.new_price);
  const errors = {
    name: !product.name.trim() && "Enter a product title",
    old_price: !(oldPrice > 0) && "Enter a valid price",
    new_price: !(newPrice > 0)
      ? "Enter a valid offer price"
      : newPrice > oldPrice && oldPrice > 0 && "Offer price should not exceed the price",
    image: !image && "Upload a product image",
  };
  const isValid = !Object.values(errors).some(Boolean);
  const [touched, setTouched] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStatus({ type: "loading", message: "" });
    try {
      const upload = await uploadImage(image);
      if (!upload.success) throw new Error("Image upload failed");
      await addProduct({ ...product, old_price: oldPrice, new_price: newPrice, image: upload.image_url });
      setStatus({ type: "success", message: `“${product.name}” was added to the catalogue.` });
      setProduct(EMPTY);
      setImage(null);
      setTouched(false);
    } catch (err) {
      setStatus({ type: "error", message: `${err.message}. Is the backend running and VITE_API_URL set correctly?` });
    }
  };

  const err = (key) => touched && errors[key] && <p className="mt-1.5 text-xs text-red-600">{errors[key]}</p>;
  const off = oldPrice > newPrice && newPrice > 0 ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium md:text-4xl">Add product</h1>
        <p className="mt-1 text-sm text-muted">Create a new listing for the storefront.</p>
      </div>

      {status.type === "success" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <HiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">
            {status.message} <Link to="/listproduct" className="font-semibold underline">View all products</Link>
          </p>
          <button onClick={() => setStatus({ type: "idle" })} aria-label="Dismiss"><HiX /></button>
        </div>
      )}
      {status.type === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          <HiExclamationCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">{status.message}</p>
          <button onClick={() => setStatus({ type: "idle" })} aria-label="Dismiss"><HiX /></button>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card space-y-5">
            <h2 className="font-sans text-base font-semibold">Details</h2>
            <div>
              <label htmlFor="name" className="label">Product title</label>
              <input id="name" name="name" value={product.name} onChange={handleChange} className="input" placeholder="e.g. Wool-blend double-breasted coat" />
              {err("name")}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="old_price" className="label">Price</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input id="old_price" name="old_price" type="number" min="0" step="0.01" value={product.old_price} onChange={handleChange} className="input pl-8" placeholder="0.00" />
                </div>
                {err("old_price")}
              </div>
              <div>
                <label htmlFor="new_price" className="label">Offer price</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input id="new_price" name="new_price" type="number" min="0" step="0.01" value={product.new_price} onChange={handleChange} className="input pl-8" placeholder="0.00" />
                </div>
                {err("new_price")}
              </div>
            </div>
            <div>
              <span className="label">Category</span>
              <div className="flex flex-wrap gap-2">
                {[["women", "Women"], ["men", "Men"], ["kid", "Kids"]].map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${
                      product.category === value ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                    }`}
                  >
                    <input type="radio" name="category" value={value} checked={product.category === value} onChange={handleChange} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-4 font-sans text-base font-semibold">Image</h2>
            <label
              htmlFor="file-input"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging ? "border-accent bg-accent-soft" : "border-line hover:border-ink/40 hover:bg-cream"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-40 rounded-xl object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-sand">
                  <HiOutlinePhotograph className="h-6 w-6 text-muted" />
                </span>
              )}
              <p className="text-sm font-medium">{image ? image.name : "Drop an image here or click to browse"}</p>
              <p className="text-xs text-muted">PNG or JPG, ideally 5:6 portrait</p>
            </label>
            <input id="file-input" type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files[0])} />
            {err("image")}
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setProduct(EMPTY); setImage(null); setTouched(false); }} className="btn-outline">
              Reset
            </button>
            <button disabled={status.type === "loading"} className="btn-dark">
              <HiOutlinePlus className="h-4 w-4" />
              {status.type === "loading" ? "Saving…" : "Add product"}
            </button>
          </div>
        </div>

        {/* live preview */}
        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Storefront preview</p>
          <div className="card p-4">
            <div className="relative grid aspect-[5/6] place-items-center overflow-hidden rounded-xl bg-sand">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <HiOutlinePhotograph className="h-10 w-10 text-muted/50" />
              )}
              {off > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">-{off}%</span>
              )}
            </div>
            <p className="mt-4 line-clamp-2 text-sm font-medium">{product.name || "Product title"}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold">{formatPrice(newPrice)}</span>
              {off > 0 && <span className="text-sm text-muted line-through">{formatPrice(oldPrice)}</span>}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
