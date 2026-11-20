"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiOutlineLockClosed, HiOutlineCash, HiOutlineCreditCard } from "react-icons/hi";
import { useCart } from "@/context/ShopContext";
import { clearCart } from "@/lib/cartStore";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import FormAlert from "./FormAlert";
import OrderSummary from "./OrderSummary";

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", span: 2 },
  { name: "phone", label: "Phone number", autoComplete: "tel", type: "tel", span: 2 },
  { name: "address", label: "Street address", autoComplete: "street-address", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State / region (optional)", autoComplete: "address-level1", optional: true },
  { name: "postal_code", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

export default function CheckoutForm({ user }) {
  const router = useRouter();
  const { ready, lines, coupon, totals } = useCart();
  const [form, setForm] = useState(() => ({
    name: user.name || "", phone: "", address: "", city: "", state: "", postal_code: "", country: "",
  }));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);
  const empty = ready && lines.length === 0 && !placing;

  useEffect(() => {
    if (empty) router.replace("/cart");
  }, [empty, router]);

  if (!ready || empty) {
    return (
      <div className="container-x py-10 md:py-14">
        <div className="skeleton h-12 w-48" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="skeleton h-[28rem]" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  const update = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setServerError("");
    const er = {};
    for (const f of FIELDS) if (!f.optional && !form[f.name].trim()) er[f.name] = `Please enter your ${f.label.toLowerCase()}`;
    if (form.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) er.phone = "Please enter a valid phone number";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(Object.keys(er)[0])?.focus();
      return;
    }

    setPlacing(true);
    try {
      const { order } = await api("/api/orders", {
        method: "POST",
        body: {
          items: lines.map(({ product, size, quantity }) => ({ id: product.id, size, quantity })),
          coupon,
          shipping_address: form,
        },
      });
      clearCart();
      router.replace(`/orders?placed=${order.id}`);
    } catch (err) {
      if (err.status === 401) {
        router.replace("/login?redirect=/checkout");
        return;
      }
      setServerError(err.message);
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-10 md:py-14">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <HiArrowLeft /> Back to bag
      </Link>
      <h1 className="mt-4 text-4xl font-medium md:text-5xl">Checkout</h1>

      <form onSubmit={placeOrder} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-medium">Shipping details</h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
                  <label htmlFor={f.name} className="label">{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type || "text"}
                    value={form[f.name]}
                    onChange={update}
                    autoComplete={f.autoComplete}
                    className="input"
                    aria-invalid={!!errors[f.name]}
                    aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                  />
                  {errors[f.name] && <p id={`${f.name}-error`} className="mt-1.5 text-xs text-red-600">{errors[f.name]}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
            <h2 className="text-2xl font-medium">Payment</h2>
            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-ink p-4">
                <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-ink focus:ring-ink" />
                <HiOutlineCash className="h-6 w-6 text-accent-dark" />
                <div>
                  <p className="font-medium">Cash on delivery</p>
                  <p className="text-sm text-muted">Pay when your order arrives.</p>
                </div>
              </label>
              <div className="flex items-center gap-4 rounded-2xl border border-line p-4 opacity-50" aria-disabled="true">
                <input type="radio" disabled className="h-4 w-4" aria-label="Card payment (coming soon)" />
                <HiOutlineCreditCard className="h-6 w-6" />
                <div>
                  <p className="font-medium">Card payment</p>
                  <p className="text-sm text-muted">Coming soon</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft md:p-8 lg:sticky lg:top-28">
          <h2 className="text-2xl font-medium">Your order</h2>
          <ul className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1 pt-2">
            {lines.map(({ key, product, size, quantity }) => (
              <li key={key} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0">
                  <Image src={product.image} alt="" fill sizes="64px" className="rounded-lg bg-sand object-cover" />
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">{quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted">Size {size}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(product.new_price * quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-line pt-6">
            <OrderSummary totals={totals} coupon={coupon} />
          </div>
          <div className="mt-6 space-y-3">
            <FormAlert>{serverError}</FormAlert>
            <button disabled={placing} className="btn-accent h-14 w-full text-base">
              <HiOutlineLockClosed className="h-5 w-5" />
              {placing ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
