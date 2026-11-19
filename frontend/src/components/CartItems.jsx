import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag, HiArrowLeft, HiOutlineLockClosed } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { formatPrice } from "../utils/format";
import { FREE_SHIPPING_AT, priceCart } from "../utils/pricing";

export default function CartItems() {
  const { cartList, setQuantity, deleteFromCart, getTotalCartAmount, getTotalCartItems, coupon, applyCoupon, removeCoupon } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const { subtotal, discount, shipping, total, toFreeShipping: toFree } = priceCart(getTotalCartAmount(), coupon);

  const submitCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(code)) {
      setCode("");
      setCouponError("");
    } else {
      setCouponError("That code isn't valid. Try WELCOME10.");
    }
  };

  if (cartList.length === 0) {
    return (
      <div className="container-x flex flex-col items-center py-28 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-soft">
          <HiOutlineShoppingBag className="h-9 w-9 text-muted" />
        </span>
        <h1 className="mt-6 text-3xl font-medium md:text-4xl">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-muted">Looks like you haven&apos;t added anything yet. Let&apos;s fix that.</p>
        <Link to="/" className="btn-dark mt-8 px-8 py-4">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12 md:py-16">
      <h1 className="text-4xl font-medium md:text-5xl">Your bag</h1>
      <p className="mt-2 text-muted">{getTotalCartItems()} item{getTotalCartItems() === 1 ? "" : "s"}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* line items */}
        <div>
          {toFree > 0 ? (
            <div className="mb-6 rounded-2xl bg-white p-5">
              <p className="text-sm">
                You&apos;re <span className="font-semibold">{formatPrice(toFree)}</span> away from free shipping
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, ((subtotal - discount) / FREE_SHIPPING_AT) * 100)}%` }} />
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl bg-accent-soft p-5 text-sm font-medium text-accent-dark">
              🎉 You&apos;ve unlocked free shipping
            </div>
          )}

          <ul className="divide-y divide-line border-y border-line">
            {cartList.map(({ key, product, size, quantity }) => (
              <li key={key} className="flex gap-4 py-6 sm:gap-6">
                <Link to={`/product/${product.id}`} className="shrink-0">
                  <img src={product.image} alt={product.name} className="h-32 w-28 rounded-xl bg-sand object-cover sm:h-36 sm:w-32" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link to={`/product/${product.id}`} className="line-clamp-2 font-medium hover:underline">
                      {product.name}
                    </Link>
                    <p className="font-semibold">{formatPrice(product.new_price * quantity)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">Size {size} · {formatPrice(product.new_price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex h-10 items-center rounded-full border border-line bg-white">
                      <button onClick={() => setQuantity(key, quantity - 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Decrease quantity">
                        <HiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => setQuantity(key, quantity + 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" aria-label="Increase quantity">
                        <HiPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => deleteFromCart(key)} className="flex items-center gap-1.5 text-sm text-muted transition hover:text-red-600">
                      <HiOutlineTrash className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <HiArrowLeft /> Continue shopping
          </Link>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft md:p-8 lg:sticky lg:top-28">
          <h2 className="text-2xl font-medium">Order summary</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-700">
                <dt>
                  Discount ({coupon}){" "}
                  <button onClick={removeCoupon} className="ml-1 text-xs text-muted underline hover:text-ink">remove</button>
                </dt>
                <dd className="font-medium">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatPrice(total)}</dd>
            </div>
          </dl>

          <form onSubmit={submitCoupon} className="mt-6">
            <label htmlFor="coupon" className="text-sm font-medium">Promo code</label>
            <div className="mt-2 flex gap-2">
              <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="input h-11" />
              <button className="btn-outline h-11 px-5">Apply</button>
            </div>
            {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
          </form>

          <button onClick={() => navigate("/checkout")} className="btn-accent mt-6 h-14 w-full text-base">
            <HiOutlineLockClosed className="h-5 w-5" /> Checkout
          </button>
          <p className="mt-3 text-center text-xs text-muted">Taxes calculated at checkout</p>
        </aside>
      </div>
    </div>
  );
}
