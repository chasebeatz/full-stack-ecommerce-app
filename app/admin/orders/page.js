import { getAllOrders } from "@/lib/server/orders";
import OrdersTable from "@/components/admin/OrdersTable";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  return <OrdersTable orders={await getAllOrders()} />;
}
