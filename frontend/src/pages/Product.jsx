import { useContext } from "react";
import { Link, useParams } from "react-router";
import { ShopContext } from "./../context/ShopContext";
import ProductHd from "../components/ProductHd";
import ProductDisplay from "../components/ProductDisplay";
import ProductDescription from "../components/ProductDescription";
import RelatedProducts from "../components/RelatedProducts";

export default function Product() {
  const { all_products } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_products.find((p) => p.id === Number(productId));

  if (!product) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-4xl font-medium">Product not found</h1>
        <p className="mt-3 text-muted">It may have sold out or moved.</p>
        <Link to="/" className="btn-dark mt-8">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 md:py-12">
      <ProductHd product={product} />
      <ProductDisplay product={product} />
      <ProductDescription />
      <RelatedProducts product={product} />
    </div>
  );
}
