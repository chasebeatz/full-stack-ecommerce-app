"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiStar, HiMinus, HiPlus, HiCheck, HiOutlineTruck, HiOutlineRefresh } from "react-icons/hi";
import prt1 from "@/assets/product_rt_1.png";
import prt2 from "@/assets/product_rt_2.png";
import prt3 from "@/assets/product_rt_3.png";
import prt4 from "@/assets/product_rt_4.png";
import { addToCart } from "@/lib/cartStore";
import { discountPercent, formatPrice } from "@/lib/format";
import { MAX_QUANTITY, SIZES } from "@/lib/pricing";

const TABS = {
  Description: [
    "A versatile everyday piece cut from soft, durable fabric with a relaxed fit that layers easily. Designed to move with you from morning commute to weekend plans.",
    "Finished with clean seams and considered details, it pairs just as well with tailored trousers as it does with your favourite denim.",
  ],
  "Care guide": [
    "Machine wash cold on a gentle cycle with similar colours. Do not bleach.",
    "Tumble dry low or lay flat to dry. Cool iron if needed. Do not dry clean.",
  ],
  "Size guide": [
    "Fits true to size. If you're between sizes, we recommend sizing up for a more relaxed fit.",
    "Model is 5'9\" / 175cm and wears a size S.",
  ],
};

export default function ProductView({ product, categoryLabel }) {
  // the extra shots are generic demo photos, so only show them for the original demo products
  const gallery = product.id <= 36 ? [product.image, prt1, prt2, prt3, prt4] : [product.image];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("Description");
  const infoRef = useRef(null);
  const off = discountPercent(product.old_price, product.new_price);

  const handleAdd = () => {
    addToCart(product.id, qty, size);
    setAdded(true);
  };

  const openSizeGuide = () => {
    setTab("Size guide");
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {gallery.length > 1 && (
            <div className="flex gap-3 sm:flex-col">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={active === i}
                  className={`relative aspect-square w-16 overflow-hidden rounded-xl bg-sand transition sm:w-20 ${
                    active === i ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[5/6] flex-1 overflow-hidden rounded-3xl bg-sand">
            <Image
              src={gallery[active]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {off > 0 && <span className="chip absolute left-4 top-4">-{off}%</span>}
          </div>
        </div>

        {/* details */}
        <div className="lg:pt-4">
          {categoryLabel && <p className="eyebrow">{categoryLabel}</p>}
          <h1 className="mt-3 text-3xl font-medium leading-tight md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="flex text-accent" aria-hidden>
              {[...Array(5)].map((_, i) => <HiStar key={i} className={`h-4 w-4 ${i === 4 ? "text-line" : ""}`} />)}
            </div>
            <span className="text-muted">4.0 · 111 reviews</span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
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

          <fieldset>
            <div className="mb-3 flex items-center justify-between text-sm">
              <legend className="font-semibold">
                Size: <span className="font-normal text-muted">{size}</span>
              </legend>
              <button type="button" onClick={openSizeGuide} className="text-muted underline underline-offset-4 hover:text-ink">
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setAdded(false);
                  }}
                  aria-pressed={size === s}
                  className={`h-12 min-w-12 rounded-xl border px-4 text-sm font-medium transition ${
                    size === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-14 items-center justify-between rounded-full border border-line bg-white px-2 sm:w-36">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Decrease quantity">
                <HiMinus />
              </button>
              <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Increase quantity">
                <HiPlus />
              </button>
            </div>
            <button onClick={handleAdd} className="btn-dark h-14 flex-1 text-base">
              {added ? <><HiCheck className="h-5 w-5" /> Added to bag</> : "Add to bag"}
            </button>
          </div>
          {added && (
            <Link href="/cart" className="btn-outline mt-3 h-14 w-full text-base">View bag & checkout</Link>
          )}

          <ul className="mt-8 space-y-3 rounded-2xl bg-white p-5 text-sm">
            <li className="flex items-center gap-3"><HiOutlineTruck className="h-5 w-5 text-accent-dark" /> Free delivery on orders over $75</li>
            <li className="flex items-center gap-3"><HiOutlineRefresh className="h-5 w-5 text-accent-dark" /> Free 30-day returns</li>
          </ul>
        </div>
      </section>

      <section ref={infoRef} className="mt-20 scroll-mt-28 border-t border-line pt-10">
        <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line">
          {Object.keys(TABS).map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition ${
                tab === name ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="max-w-3xl space-y-4 py-8 leading-relaxed text-ink/75">
          {TABS[tab].map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>
    </>
  );
}
