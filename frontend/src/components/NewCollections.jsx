import { useContext } from "react";
import LATEST from "../assets/latest";
import { ShopContext } from "../context/ShopContext";
import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";

export default function NewCollections() {
  const { all_products } = useContext(ShopContext);
  const products = LATEST.map((p) => all_products.find((a) => a.id === p.id)).filter(Boolean);

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Just landed" title="New arrivals" linkTo="/mens" linkLabel="Shop all" />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
