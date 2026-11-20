import { getAllProducts } from "@/lib/server/products";
import ProductTable from "@/components/admin/ProductTable";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  return <ProductTable products={await getAllProducts()} />;
}
