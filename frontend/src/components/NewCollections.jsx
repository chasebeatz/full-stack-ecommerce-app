import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";

export default function NewCollections() {
  const { all_products } = useContext(ShopContext);
  // newest first, so products added in the admin show up here
  const products = [...all_products].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Just landed" title="New arrivals" linkTo="/mens" linkLabel="Shop all" />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
