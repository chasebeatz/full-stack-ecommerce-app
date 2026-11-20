import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CategoryTiles from "@/components/CategoryTiles";
import Offer from "@/components/Offer";
import NewsLetter from "@/components/NewsLetter";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { getProducts } from "@/lib/server/products";

const POPULAR_IDS = [1, 2, 3, 4];

export default async function HomePage() {
  const products = await getProducts();
  let popular = POPULAR_IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (popular.length < 4) popular = products.slice(0, 4);
  // newest first, so products added in the admin show up here
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <>
      <Hero />
      <Features />
      <CategoryTiles />
      <section className="bg-white py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Best sellers" title="Popular right now" href="/womens" />
          <ProductGrid products={popular} />
        </div>
      </section>
      <Offer />
      <section id="new" className="scroll-mt-24 py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Just landed" title="New arrivals" href="/mens" linkLabel="Shop all" />
          {newest.length ? (
            <ProductGrid products={newest} />
          ) : (
            <p className="rounded-2xl bg-white p-10 text-center text-muted">New products are on their way. Check back soon.</p>
          )}
        </div>
      </section>
      <NewsLetter />
    </>
  );
}
