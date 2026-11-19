import { useContext, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductGrid from "../components/ProductGrid";

const PAGE_SIZE = 8;
const SORTS = {
  featured: { label: "Featured", fn: () => 0 },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.new_price - b.new_price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.new_price - a.new_price },
  discount: {
    label: "Biggest discount",
    fn: (a, b) => (b.old_price - b.new_price) / b.old_price - (a.old_price - a.new_price) / a.old_price,
  },
};
const TITLES = { men: "Men", women: "Women", kid: "Kids" };

export default function Category({ category, banner }) {
  const { all_products } = useContext(ShopContext);
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const products = useMemo(
    () => all_products.filter((p) => p.category === category).sort(SORTS[sort].fn),
    [all_products, category, sort]
  );
  const shown = products.slice(0, visible);

  return (
    <div className="container-x py-8 md:py-12">
      <div className="overflow-hidden rounded-3xl bg-sand">
        <img src={banner} alt={`${TITLES[category]} collection`} className="block w-full object-cover" />
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-4xl font-medium md:text-5xl">{TITLES[category]}</h1>
          <p className="mt-2 text-sm text-muted">
            Showing {shown.length} of {products.length} products
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span className="text-muted">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border-line bg-white py-2.5 pl-4 pr-10 text-sm font-medium focus:border-ink focus:ring-0"
          >
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-10">
        <ProductGrid products={shown} />
      </div>

      {visible < products.length && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="h-1 w-48 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-ink" style={{ width: `${(shown.length / products.length) * 100}%` }} />
          </div>
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline px-10">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
