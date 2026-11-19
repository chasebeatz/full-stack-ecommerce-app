import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ShopContext } from "./../context/ShopContext";
import ProductHd from "../components/ProductHd";
import ProductDisplay from "../components/ProductDisplay";
import ProductDescription from "../components/ProductDescription";
import RelatedProducts from "../components/RelatedProducts";

export default function Product() {
  const { all_products, productsStatus } = useContext(ShopContext);
  const { productId } = useParams();
  const [tab, setTab] = useState("Description");
  const product = all_products.find((p) => p.id === Number(productId));

  useEffect(() => setTab("Description"), [productId]);

  const openSizeGuide = () => {
    setTab("Size guide");
    document.getElementById("product-info")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!product && productsStatus === "loading") {
    return (
      <div className="container-x grid gap-10 py-12 lg:grid-cols-2">
        <div className="aspect-[5/6] animate-pulse rounded-3xl bg-sand" />
        <div className="space-y-4 pt-4">
          <div className="h-10 w-3/4 animate-pulse rounded bg-sand" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-sand" />
        </div>
      </div>
    );
  }

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
      <ProductDisplay product={product} onSizeGuide={openSizeGuide} />
      <ProductDescription tab={tab} setTab={setTab} />
      <RelatedProducts product={product} />
    </div>
  );
}
