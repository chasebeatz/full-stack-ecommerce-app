import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { HiCheckCircle, HiOutlineShoppingBag, HiOutlineRefresh } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import FormAlert from "../components/FormAlert";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-800",
  processing: "bg-blue-50 text-blue-800",
  shipped: "bg-indigo-50 text-indigo-800",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-red-50 text-red-700",
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function Orders() {
  const { authApi } = useAuth();
  const [params] = useSearchParams();
  const placedId = Number(params.get("placed"));
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const data = await authApi("/orders");
      setOrders(data.orders);
      setState("ready");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }, [authApi]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container-x py-10 md:py-14">
      {placedId > 0 && (
        <div className="mb-10 rounded-3xl bg-white p-8 text-center shadow-soft">
          <HiCheckCircle className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="mt-4 text-3xl font-medium md:text-4xl">Thank you for your order!</h1>
          <p className="mt-2 text-muted">
            Order <span className="font-semibold text-ink">#{placedId}</span> is confirmed. You&apos;ll pay on delivery.
          </p>
          <Link to="/" className="btn-dark mt-6">Continue shopping</Link>
        </div>
      )}

      <h2 className="text-3xl font-medium md:text-4xl">My orders</h2>

      {state === "loading" && (
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-white" />)}
        </div>
      )}

      {state === "error" && (
        <div className="mt-8 max-w-md space-y-4">
          <FormAlert>{error}</FormAlert>
          <button onClick={load} className="btn-outline"><HiOutlineRefresh /> Try again</button>
        </div>
      )}

      {state === "ready" && orders.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center">
          <HiOutlineShoppingBag className="h-10 w-10 text-muted" />
          <p className="mt-4 font-medium">No orders yet</p>
          <Link to="/" className="btn-dark mt-6">Start shopping</Link>
        </div>
      )}

      {state === "ready" && orders.length > 0 && (
        <ul className="mt-8 space-y-5">
          {orders.map((order) => (
            <li
              key={order.id}
              className={`overflow-hidden rounded-3xl bg-white shadow-soft ${order.id === placedId ? "ring-2 ring-accent" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/60 px-6 py-4 text-sm">
                <div className="flex flex-wrap gap-x-8 gap-y-1">
                  <p><span className="text-muted">Order </span><span className="font-semibold">#{order.id}</span></p>
                  <p><span className="text-muted">Placed </span>{formatDate(order.created_at)}</p>
                  <p><span className="text-muted">Total </span><span className="font-semibold">{formatPrice(order.total)}</span></p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[order.status] || ""}`}>
                  {order.status}
                </span>
              </div>
              <ul className="divide-y divide-line px-6">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 py-4">
                    <img src={item.image} alt="" className="h-16 w-14 rounded-lg bg-sand object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${item.id}`} className="line-clamp-1 text-sm font-medium hover:underline">{item.name}</Link>
                      <p className="text-xs text-muted">Size {item.size} · Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-6 py-4 text-sm text-muted">
                Shipping to {order.shipping_address.name}, {order.shipping_address.address}, {order.shipping_address.city},{" "}
                {order.shipping_address.country}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
