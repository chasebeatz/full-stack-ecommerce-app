"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlinePhotograph, HiOutlinePlus, HiCheckCircle, HiX } from "react-icons/hi";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import FormAlert from "../FormAlert";

const EMPTY = { name: "", old_price: "", new_price: "", category: "women" };
const MAX_BYTES = 4 * 1024 * 1024;

export default function AddProductForm() {
  const [product, setProduct] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "", id: null });

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URLs must be created and revoked together
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview("");
    };
  }, [image]);

  const handleChange = (e) => setProduct((p) => ({ ...p, [e.target.name]: e.target.value }));
  const [fileError, setFileError] = useState("");
  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFileError("That file isn't an image.");
    if (file.size > MAX_BYTES) return setFileError("Images must be 4 MB or smaller.");
    setFileError("");
    setImage(file);
  };

  const oldPrice = Number(product.old_price);
  const newPrice = Number(product.new_price);
  const errors = {
    name: !product.name.trim() && "Enter a product title",
    old_price: !(oldPrice > 0) && "Enter a valid price",
    new_price: !(newPrice > 0) ? "Enter a valid offer price" : newPrice > oldPrice && oldPrice > 0 && "Offer price should not be higher than the price",
    image: !image && (fileError || "Upload a product image"),
  };
  const isValid = !Object.values(errors).some(Boolean);

  const reset = () => {
    setProduct(EMPTY);
    setImage(null);
    setTouched(false);
    setFileError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStatus({ type: "loading", message: "" });
    try {
      const body = new FormData();
      body.append("image", image);
      const { image_url } = await api("/api/admin/upload", { method: "POST", body });
      const { product: created } = await api("/api/admin/products", {
        method: "POST",
        body: { ...product, old_price: oldPrice, new_price: newPrice, image: image_url },
      });
      setStatus({ type: "success", message: `“${created.name}” is now live in the store.`, id: created.id });
      reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const err = (key) => touched && errors[key] && <p className="mt-1.5 text-xs text-red-600">{errors[key]}</p>;
  const off = discountPercent(oldPrice, newPrice);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium md:text-4xl">Add product</h1>
        <p className="mt-1 text-sm text-muted">Create a new listing for the storefront.</p>
      </div>

      {status.type === "success" && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <HiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">
            {status.message}{" "}
            <Link href={`/product/${status.id}`} target="_blank" className="font-semibold underline">View it</Link> ·{" "}
            <Link href="/admin/products" className="font-semibold underline">All products</Link>
          </p>
          <button onClick={() => setStatus({ type: "idle" })} aria-label="Dismiss"><HiX /></button>
        </div>
      )}
      {status.type === "error" && <div className="mb-6"><FormAlert>{status.message}</FormAlert></div>}

      <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card space-y-5">
            <h2 className="font-sans text-base font-semibold tracking-normal">Details</h2>
            <div>
              <label htmlFor="name" className="label">Product title</label>
              <input id="name" name="name" value={product.name} onChange={handleChange} maxLength={200} className="input" placeholder="e.g. Wool-blend double-breasted coat" />
              {err("name")}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[["old_price", "Price"], ["new_price", "Offer price"]].map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={key} className="label">{label}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input id={key} name={key} type="number" inputMode="decimal" min="0" step="0.01" value={product[key]} onChange={handleChange} className="input pl-8" placeholder="0.00" />
                  </div>
                  {err(key)}
                </div>
              ))}
            </div>
            <fieldset>
              <legend className="label">Category</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                      product.category === value ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                    }`}
                  >
                    <input type="radio" name="category" value={value} checked={product.category === value} onChange={handleChange} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="card">
            <h2 className="mb-4 font-sans text-base font-semibold tracking-normal">Image</h2>
            <label
              htmlFor="file-input"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging ? "border-accent bg-accent-soft" : "border-line hover:border-ink/40 hover:bg-cream"
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={preview} alt="Preview" className="h-40 rounded-xl object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-sand">
                  <HiOutlinePhotograph className="h-6 w-6 text-muted" />
                </span>
              )}
              <p className="text-sm font-medium">{image ? image.name : "Drop an image here or click to browse"}</p>
              <p className="text-xs text-muted">PNG, JPG or WebP up to 4 MB, ideally 5:6 portrait</p>
            </label>
            <input id="file-input" type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files[0])} />
            {(touched || fileError) && errors.image && <p className="mt-1.5 text-xs text-red-600">{errors.image}</p>}
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={reset} className="btn-outline">Reset</button>
            <button disabled={status.type === "loading"} className="btn-dark">
              <HiOutlinePlus className="h-4 w-4" />
              {status.type === "loading" ? "Saving…" : "Add product"}
            </button>
          </div>
        </div>

        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Storefront preview</p>
          <div className="card p-4">
            <div className="relative grid aspect-[5/6] place-items-center overflow-hidden rounded-xl bg-sand">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <HiOutlinePhotograph className="h-10 w-10 text-muted/50" />
              )}
              {off > 0 && <span className="chip absolute left-3 top-3">-{off}%</span>}
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
