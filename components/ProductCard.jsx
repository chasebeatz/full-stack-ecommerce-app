"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlinePlus, HiCheck } from "react-icons/hi";
import { addToCart } from "@/lib/cartStore";
import { discountPercent, formatPrice } from "@/lib/format";

export default function ProductCard({ product, priority = false }) {
  const [added, setAdded] = useState(false);
  const off = discountPercent(product.old_price, product.new_price);

  const quickAdd = (e) => {
    e.preventDefault();
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {off > 0 && <span className="chip absolute left-3 top-3">-{off}%</span>}
        <button
          onClick={quickAdd}
          aria-label={`Add ${product.name} to bag, size M`}
          className={`absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold shadow-soft transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100 ${
            added ? "!translate-y-0 bg-ink text-white !opacity-100" : "bg-white text-ink hover:bg-ink hover:text-white"
          }`}
        >
          {added ? <HiCheck className="h-4 w-4" /> : <HiOutlinePlus className="h-4 w-4" />}
          <span className="hidden xs:inline">{added ? "Added" : "Add"}</span>
        </button>
      </div>
      <div className="mt-4 space-y-1.5 px-0.5">
        <h3 className="line-clamp-2 font-sans text-sm font-medium leading-snug tracking-normal text-ink/90 transition group-hover:text-ink">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink">{formatPrice(product.new_price)}</span>
          {off > 0 && <span className="text-sm text-muted line-through">{formatPrice(product.old_price)}</span>}
        </div>
      </div>
    </Link>
  );
}
