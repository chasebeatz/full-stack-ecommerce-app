import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/server/session";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/checkout");
  return <CheckoutForm user={user} />;
}
