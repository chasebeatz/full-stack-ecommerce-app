"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePlus, HiOutlineExternalLink } from "react-icons/hi";
import { api } from "@/lib/api";
import { CATEGORIES, categoryByValue } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import FormAlert from "../FormAlert";

const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES];

export default function ProductTable({ products: initial }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");

  const remove = async (p) => {
    if (!window.confirm(`Remove “${p.name}” from the store? This can't be undone.`)) return;
    setRemoving(p.id);
    setError("");
    try {
      await api(`/api/admin/products/${p.id}`, { method: "DELETE" });
      setProducts((list) => list.filter((x) => x.id !== p.id));
      router.refresh();
    } catch (err) {
      setError(`Couldn't remove “${p.name}”: ${err.message}`);
    } finally {
      setRemoving(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (category === "all" || p.category === category) && p.name.toLowerCase().includes(q));
  }, [products, query, category]);

  const stats = [["Products", products.length], ...CATEGORIES.map((c) => [c.label, products.filter((p) => p.category === c.value).length])];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium md:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted">Everything currently listed on the storefront.</p>
        </div>
        <Link href="/admin/products/new" className="btn-dark"><HiOutlinePlus className="h-4 w-4" /> Add product</Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {error && <div className="mb-4"><FormAlert>{error}</FormAlert></div>}

      <div className="card p-0">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="input h-10 pl-10" aria-label="Search products" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  category === value ? "bg-ink text-white" : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">{products.length ? "No products match your filters" : "No products yet"}</p>
            <p className="mt-1 text-sm text-muted">
              {products.length ? "Try a different search or category." : "Add your first product to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Offer</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-cream">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                          <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="line-clamp-1 font-medium">{p.name}</p>
                          <p className="text-xs text-muted">#{p.id}{p.available === false && " · hidden"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium">{categoryByValue(p.category)?.label || p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted line-through">{formatPrice(p.old_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.new_price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
                          aria-label={`View ${p.name} in the store`}
                        >
                          <HiOutlineExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => remove(p)}
                          disabled={removing === p.id}
                          className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          aria-label={`Remove ${p.name}`}
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
