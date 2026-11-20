"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag, HiArrowLeft, HiOutlineLockClosed } from "react-icons/hi";
import { useCart } from "@/context/ShopContext";
import { applyCoupon, removeCoupon, removeFromCart, setQuantity } from "@/lib/cartStore";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_AT, MAX_QUANTITY } from "@/lib/pricing";
import OrderSummary from "./OrderSummary";

export default function CartView() {
  const { ready, lines, count, coupon, totals } = useCart();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const submitCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(code)) {
      setCode("");
      setCouponError("");
    } else {
      setCouponError("That code isn't valid. Try WELCOME10.");
    }
  };

  if (!ready) {
    return (
      <div className="container-x py-12 md:py-16">
        <div className="skeleton h-12 w-56" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="skeleton h-40" />)}</div>
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center py-28 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-soft">
          <HiOutlineShoppingBag className="h-9 w-9 text-muted" />
        </span>
        <h1 className="mt-6 text-3xl font-medium md:text-4xl">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-muted">Looks like you haven&apos;t added anything yet. Let&apos;s fix that.</p>
        <Link href="/" className="btn-dark mt-8 px-8 py-4">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 md:py-16">
      <h1 className="text-4xl font-medium md:text-5xl">Your bag</h1>
      <p className="mt-2 text-muted">{count} item{count === 1 ? "" : "s"}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          {totals.toFreeShipping > 0 ? (
            <div className="mb-6 rounded-2xl bg-white p-5">
              <p className="text-sm">
                You&apos;re <span className="font-semibold">{formatPrice(totals.toFreeShipping)}</span> away from free shipping
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min(100, ((FREE_SHIPPING_AT - totals.toFreeShipping) / FREE_SHIPPING_AT) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl bg-accent-soft p-5 text-sm font-medium text-accent-dark">
              🎉 You&apos;ve unlocked free shipping
            </div>
          )}

          <ul className="divide-y divide-line border-y border-line">
            {lines.map(({ key, product, size, quantity }) => (
              <li key={key} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/product/${product.id}`} className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-36 sm:w-32">
                  <Image src={product.image} alt={product.name} fill sizes="128px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${product.id}`} className="line-clamp-2 font-medium hover:underline">{product.name}</Link>
                    <p className="font-semibold">{formatPrice(product.new_price * quantity)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">Size {size} · {formatPrice(product.new_price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex h-10 items-center rounded-full border border-line bg-white">
                      <button onClick={() => setQuantity(key, quantity - 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label={`Decrease quantity of ${product.name}`}>
                        <HiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(key, quantity + 1)}
                        disabled={quantity >= MAX_QUANTITY}
                        className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand disabled:opacity-40"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <HiPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(key)} className="flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600">
                      <HiOutlineTrash className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <HiArrowLeft /> Continue shopping
          </Link>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft md:p-8 lg:sticky lg:top-28">
          <h2 className="text-2xl font-medium">Order summary</h2>
          <div className="mt-6">
            <OrderSummary totals={totals} coupon={coupon} onRemoveCoupon={removeCoupon} />
          </div>

          {!coupon && (
            <form onSubmit={submitCoupon} className="mt-6">
              <label htmlFor="coupon" className="text-sm font-medium">Promo code</label>
              <div className="mt-2 flex gap-2">
                <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="input h-11" />
                <button className="btn-outline h-11 px-5">Apply</button>
              </div>
              {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
            </form>
          )}

          <Link href="/checkout" className="btn-accent mt-6 h-14 w-full text-base">
            <HiOutlineLockClosed className="h-5 w-5" /> Checkout
          </Link>
          <p className="mt-3 text-center text-xs text-muted">Pay with cash when your order arrives</p>
        </aside>
      </div>
    </div>
  );
}
