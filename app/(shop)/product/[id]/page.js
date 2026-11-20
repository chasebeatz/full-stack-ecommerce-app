import Link from "next/link";
import { notFound } from "next/navigation";
import { HiChevronRight } from "react-icons/hi";
import ProductView from "@/components/ProductView";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { categoryByValue } from "@/lib/catalog";
import { getProduct, getProducts } from "@/lib/server/products";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }) {
  const product = await getProduct((await params).id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.name} — now $${product.new_price.toFixed(2)} at Shoppee. Free shipping over $75.`,
    openGraph: { images: [{ url: product.image }] },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const category = categoryByValue(product.category);
  const related = (await getProducts()).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    offers: { "@type": "Offer", price: product.new_price.toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock" },
  };

  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <HiChevronRight className="h-4 w-4" />
        {category && (
          <>
            <Link href={`/${category.slug}`} className="hover:text-ink">{category.label}</Link>
            <HiChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="line-clamp-1 text-ink" aria-current="page">{product.name}</span>
      </nav>

      <ProductView key={product.id} product={product} categoryLabel={category?.label} />

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeading eyebrow="You may also like" title="Related products" href={category && `/${category.slug}`} />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
