import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { HiStar, HiMinus, HiPlus, HiCheck, HiOutlineTruck, HiOutlineRefresh } from "react-icons/hi";
import prt1 from "./../assets/product_rt_1.png";
import prt2 from "./../assets/product_rt_2.png";
import prt3 from "./../assets/product_rt_3.png";
import prt4 from "./../assets/product_rt_4.png";
import { ShopContext } from "../context/ShopContext";
import { discountPercent, formatPrice } from "../utils/format";

const SIZES = ["XS", "S", "M", "L", "XL"];
const CATEGORY_LABEL = { men: "Men", women: "Women", kid: "Kids" };

export default function ProductDisplay({ product }) {
  const { addToCart } = useContext(ShopContext);
  const gallery = [product.image, prt1, prt2, prt3, prt4];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const off = discountPercent(product.old_price, product.new_price);

  // reset state when navigating between products
  useEffect(() => {
    setActive(0);
    setQty(1);
    setAdded(false);
  }, [product.id]);

  const handleAdd = () => {
    addToCart(product.id, qty);
    setAdded(true);
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* gallery */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <div className="flex gap-3 sm:flex-col">
          {gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`aspect-square w-16 overflow-hidden rounded-xl bg-sand transition sm:w-20 ${
                active === i ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-3xl bg-sand">
          <img src={gallery[active]} alt={product.name} className="aspect-[5/6] h-full w-full object-cover" />
          {off > 0 && <span className="chip absolute left-4 top-4">-{off}%</span>}
        </div>
      </div>

      {/* details */}
      <div className="lg:pt-4">
        <p className="eyebrow">{CATEGORY_LABEL[product.category]}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight md:text-4xl">{product.name}</h1>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="flex text-accent">
            {[...Array(5)].map((_, i) => (
              <HiStar key={i} className={`h-4 w-4 ${i === 4 ? "text-line" : ""}`} />
            ))}
          </div>
          <span className="text-muted">4.0 · 111 reviews</span>
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-semibold">{formatPrice(product.new_price)}</span>
          {off > 0 && (
            <>
              <span className="text-lg text-muted line-through">{formatPrice(product.old_price)}</span>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-dark">
                Save {formatPrice(product.old_price - product.new_price)}
              </span>
            </>
          )}
        </div>

        <hr className="my-8 border-line" />

        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              Size: <span className="font-normal text-muted">{size}</span>
            </span>
            <button className="text-muted underline underline-offset-4 hover:text-ink">Size guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`h-12 min-w-12 rounded-xl border px-4 text-sm font-medium transition ${
                  size === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-14 items-center justify-between rounded-full border border-line bg-white px-2 sm:w-36">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Decrease quantity">
              <HiMinus />
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Increase quantity">
              <HiPlus />
            </button>
          </div>
          <button onClick={handleAdd} className="btn-dark h-14 flex-1 text-base">
            {added ? <><HiCheck className="h-5 w-5" /> Added to bag</> : "Add to bag"}
          </button>
        </div>
        {added && (
          <Link to="/cart-page" className="btn-outline mt-3 h-14 w-full text-base">
            View bag & checkout
          </Link>
        )}

        <ul className="mt-8 space-y-3 rounded-2xl bg-white p-5 text-sm">
          <li className="flex items-center gap-3">
            <HiOutlineTruck className="h-5 w-5 text-accent-dark" />
            Free delivery on orders over $75
          </li>
          <li className="flex items-center gap-3">
            <HiOutlineRefresh className="h-5 w-5 text-accent-dark" />
            Free 30-day returns
          </li>
        </ul>
      </div>
    </section>
  );
}
