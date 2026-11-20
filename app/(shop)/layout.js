import { ShopProvider } from "@/context/ShopContext";
import { getProducts } from "@/lib/server/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Catalogue pages are cached and rebuilt at most every 5 minutes (or straight away when the admin edits products).
export const revalidate = 300;

export default async function ShopLayout({ children }) {
  const products = await getProducts();
  return (
    <ShopProvider products={products}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ShopProvider>
  );
}
