import { formatPrice } from "@/lib/format";

// Subtotal / discount / shipping / total rows, shared by the bag and checkout.
export default function OrderSummary({ totals, coupon, onRemoveCoupon }) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-medium">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-green-700">
          <dt>
            Discount ({coupon})
            {onRemoveCoupon && (
              <button onClick={onRemoveCoupon} className="ml-2 text-xs text-muted underline hover:text-ink">remove</button>
            )}
          </dt>
          <dd className="font-medium">−{formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted">Shipping</dt>
        <dd className="font-medium">{totals.shipping ? formatPrice(totals.shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}
