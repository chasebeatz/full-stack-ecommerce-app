import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { HiOutlineSearch, HiOutlineTrash, HiOutlinePlus, HiOutlineRefresh, HiExclamationCircle } from "react-icons/hi";
import { formatPrice, getProducts, removeProduct } from "../lib/api";

const CATEGORIES = [["all", "All"], ["women", "Women"], ["men", "Men"], ["kid", "Kids"]];

export default function ListProduct() {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      setProducts(await getProducts());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Remove “${p.name}” from the catalogue?`)) return;
    setRemoving(p.id);
    try {
      await removeProduct(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch {
      alert("Couldn't remove the product. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [products, query, category]
  );

  const stats = [
    ["Products", products.length],
    ["Women", products.filter((p) => p.category === "women").length],
    ["Men", products.filter((p) => p.category === "men").length],
    ["Kids", products.filter((p) => p.category === "kid").length],
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium md:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted">Everything currently listed on the storefront.</p>
        </div>
        <Link to="/addproduct" className="btn-dark">
          <HiOutlinePlus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl">{state === "ready" ? value : "—"}</p>
          </div>
        ))}
      </div>

      <div className="card p-0">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="input h-10 pl-10" aria-label="Search products" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  category === value ? "bg-ink text-white" : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {state === "loading" && (
          <ul className="divide-y divide-line">
            {[...Array(4)].map((_, i) => (
              <li key={i} className="flex animate-pulse items-center gap-4 p-4">
                <div className="h-14 w-12 rounded-lg bg-sand" />
                <div className="h-4 flex-1 rounded bg-sand" />
                <div className="h-4 w-16 rounded bg-sand" />
              </li>
            ))}
          </ul>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <HiExclamationCircle className="h-10 w-10 text-red-500" />
            <p className="mt-3 font-medium">Couldn&apos;t load products</p>
            <p className="mt-1 text-sm text-muted">Make sure the backend is running on port 5000.</p>
            <button onClick={load} className="btn-outline mt-5"><HiOutlineRefresh /> Try again</button>
          </div>
        )}

        {state === "ready" && filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">{products.length ? "No products match your filters" : "No products yet"}</p>
            <p className="mt-1 text-sm text-muted">
              {products.length ? "Try a different search or category." : "Add your first product to get started."}
            </p>
          </div>
        )}

        {state === "ready" && filtered.length > 0 && (
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
                        <img src={p.image} alt="" className="h-14 w-12 rounded-lg bg-sand object-cover" />
                        <div>
                          <p className="line-clamp-1 font-medium">{p.name}</p>
                          <p className="text-xs text-muted">#{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium capitalize">
                        {p.category === "kid" ? "Kids" : p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted line-through">{formatPrice(p.old_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.new_price)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(p)}
                        disabled={removing === p.id}
                        className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label={`Remove ${p.name}`}
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
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
