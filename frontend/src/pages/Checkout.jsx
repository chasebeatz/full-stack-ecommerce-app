import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { HiArrowLeft, HiOutlineLockClosed, HiOutlineCash, HiOutlineCreditCard } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import { priceCart } from "../utils/pricing";
import FormAlert from "../components/FormAlert";

const FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", span: 2 },
  { name: "phone", label: "Phone number", autoComplete: "tel", type: "tel", span: 2 },
  { name: "address", label: "Street address", autoComplete: "street-address", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State / region (optional)", autoComplete: "address-level1", optional: true },
  { name: "postal_code", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

export default function Checkout() {
  const { cartList, coupon, getTotalCartAmount, clearCart } = useContext(ShopContext);
  const { user, authApi } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    name: user?.name || "", phone: "", address: "", city: "", state: "", postal_code: "", country: "",
  }));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);

  if (cartList.length === 0 && !placing) return <Navigate to="/cart-page" replace />;

  const totals = priceCart(getTotalCartAmount(), coupon);

  const update = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setServerError("");
    const er = {};
    for (const f of FIELDS) if (!f.optional && !form[f.name].trim()) er[f.name] = `Please enter your ${f.label.toLowerCase()}`;
    if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) er.phone = "Please enter a valid phone number";
    setErrors(er);
    if (Object.keys(er).length) return;

    setPlacing(true);
    try {
      const { order } = await authApi("/orders", {
        method: "POST",
        body: {
          items: cartList.map(({ product, size, quantity }) => ({ id: product.id, size, quantity })),
          coupon,
          shipping_address: form,
        },
      });
      clearCart();
      navigate(`/orders?placed=${order.id}`, { replace: true });
    } catch (err) {
      setServerError(err.status === 401 ? "Your session expired. Please sign in again." : err.message);
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-10 md:py-14">
      <Link to="/cart-page" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <HiArrowLeft /> Back to bag
      </Link>
      <h1 className="mt-4 text-4xl font-medium md:text-5xl">Checkout</h1>

      <form onSubmit={placeOrder} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium">Shipping details</h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
                  <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium">{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type || "text"}
                    value={form[f.name]}
                    onChange={update}
                    autoComplete={f.autoComplete}
                    className="input"
                    aria-invalid={!!errors[f.name]}
                  />
                  {errors[f.name] && <p className="mt-1.5 text-xs text-red-600">{errors[f.name]}</p>}
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
                <input type="radio" disabled className="h-4 w-4" />
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
          <ul className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">
            {cartList.map(({ key, product, size, quantity }) => (
              <li key={key} className="flex gap-3">
                <div className="relative shrink-0">
                  <img src={product.image} alt="" className="h-20 w-16 rounded-lg bg-sand object-cover" />
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
          <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-green-700"><dt>Discount ({coupon})</dt><dd>−{formatPrice(totals.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{totals.shipping ? formatPrice(totals.shipping) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>

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
