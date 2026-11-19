import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";

export default function RelatedProducts({ product }) {
  const { all_products } = useContext(ShopContext);
  const related = all_products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (!related.length) return null;

  return (
    <section className="mt-12">
      <SectionHeading eyebrow="You may also like" title="Related products" />
      <ProductGrid products={related} />
    </section>
  );
}
