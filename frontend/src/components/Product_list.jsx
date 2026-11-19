import { useContext } from "react";
import POPULAR from "../assets/popular";
import { ShopContext } from "../context/ShopContext";
import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";

export default function Popular_products() {
  const { all_products } = useContext(ShopContext);
  // resolve against the master catalogue so the card matches the product page
  const products = POPULAR.map((p) => all_products.find((a) => a.id === p.id)).filter(Boolean);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Best sellers" title="Popular right now" linkTo="/womens" />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
