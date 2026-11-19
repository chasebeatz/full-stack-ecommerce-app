import { useContext, useState } from "react";
import { Link } from "react-router";
import { HiOutlinePlus, HiCheck } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { discountPercent, formatPrice } from "../utils/format";

export const ProductCard = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [added, setAdded] = useState(false);
  const off = discountPercent(product.old_price, product.new_price);

  const quickAdd = (e) => {
    e.preventDefault();
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-sand">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {off > 0 && <span className="chip absolute left-3 top-3">-{off}%</span>}
        <button
          onClick={quickAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold shadow-soft transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 ${
            added ? "bg-ink text-white !translate-y-0 !opacity-100" : "bg-white text-ink hover:bg-ink hover:text-white"
          }`}
        >
          {added ? <HiCheck className="h-4 w-4" /> : <HiOutlinePlus className="h-4 w-4" />}
          <span className="hidden xs:inline">{added ? "Added" : "Add"}</span>
        </button>
      </div>
      <div className="mt-4 space-y-1.5 px-0.5">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug text-ink/90 transition group-hover:text-ink">
          {product.name}
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink">{formatPrice(product.new_price)}</span>
          {off > 0 && <span className="text-sm text-muted line-through">{formatPrice(product.old_price)}</span>}
        </div>
      </div>
    </Link>
  );
};
