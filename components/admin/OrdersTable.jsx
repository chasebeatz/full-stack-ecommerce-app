"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HiChevronDown } from "react-icons/hi";
import { api } from "@/lib/api";
import { ORDER_STATUSES, STATUS_STYLE, formatPrice } from "@/lib/format";
import FormAlert from "../FormAlert";

const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function OrdersTable({ orders: initial }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const changeStatus = async (order, status) => {
    setSaving(order.id);
    setError("");
    try {
      const { order: updated } = await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: { status } });
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(`Couldn't update order #${order.id}: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const shown = useMemo(() => (filter === "all" ? orders : orders.filter((o) => o.status === filter)), [orders, filter]);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const stats = [
    ["Orders", orders.length],
    ["To fulfil", orders.filter((o) => o.status === "pending" || o.status === "processing").length],
    ["Delivered", orders.filter((o) => o.status === "delivered").length],
    ["Revenue", formatPrice(revenue)],
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-medium md:text-4xl">Orders</h1>
        <p className="mt-1 text-sm text-muted">Update an order&apos;s status as you fulfil it.</p>
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
        <div className="flex gap-1 overflow-x-auto border-b border-line p-4">
          {["all", ...ORDER_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                filter === s ? "bg-ink text-white" : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">No {filter !== "all" && `“${filter}” `}orders yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((o) => (
              <li key={o.id}>
                <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap">
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={expanded === o.id}
                  >
                    <HiChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${expanded === o.id ? "rotate-180" : ""}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">#{o.id} · {o.shipping_address.name}</p>
                      <p className="truncate text-xs text-muted">
                        {o.email} · {formatDateTime(o.created_at)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                    </div>
                  </button>
                  <p className="w-24 text-right text-sm font-semibold">{formatPrice(o.total)}</p>
                  <select
                    value={o.status}
                    disabled={saving === o.id}
                    onChange={(e) => changeStatus(o, e.target.value)}
                    className={`rounded-full border-0 py-1.5 pl-3 pr-8 text-xs font-semibold capitalize focus:ring-2 focus:ring-ink ${STATUS_STYLE[o.status]}`}
                    aria-label={`Status of order ${o.id}`}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {expanded === o.id && (
                  <div className="grid gap-6 bg-cream/60 px-4 py-5 sm:px-11 md:grid-cols-2">
                    <ul className="space-y-3">
                      {o.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-sand">
                            <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                          </div>
                          <span className="min-w-0 flex-1 truncate">{item.name}</span>
                          <span className="text-muted">{item.size} × {item.quantity}</span>
                          <span className="w-20 text-right">{formatPrice(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-semibold">Ship to</p>
                        <p className="text-muted">
                          {o.shipping_address.name} · {o.shipping_address.phone}
                          <br />
                          {o.shipping_address.address}, {o.shipping_address.city}
                          {o.shipping_address.state && `, ${o.shipping_address.state}`} {o.shipping_address.postal_code}
                          <br />
                          {o.shipping_address.country}
                        </p>
                      </div>
                      <dl className="space-y-1">
                        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
                        {Number(o.discount) > 0 && (
                          <div className="flex justify-between"><dt className="text-muted">Discount ({o.coupon})</dt><dd>−{formatPrice(o.discount)}</dd></div>
                        )}
                        <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{Number(o.shipping) ? formatPrice(o.shipping) : "Free"}</dd></div>
                        <div className="flex justify-between font-semibold"><dt>Total · cash on delivery</dt><dd>{formatPrice(o.total)}</dd></div>
                      </dl>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
