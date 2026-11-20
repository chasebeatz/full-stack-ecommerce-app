import Image from "next/image";
import { notFound } from "next/navigation";
import CategoryView from "@/components/CategoryView";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { getProducts } from "@/lib/server/products";
import bannermens from "@/assets/bannermens.png";
import bannerwomens from "@/assets/bannerwomens.png";
import bannerkids from "@/assets/bannerkids.png";

const BANNERS = { men: bannermens, women: bannerwomens, kid: bannerkids };

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ category: c.slug }));

export async function generateMetadata({ params }) {
  const category = categoryBySlug((await params).category);
  return category ? { title: `${category.label}'s clothing`, description: `Shop ${category.label.toLowerCase()}'s clothing at Shoppee.` } : {};
}

export default async function CategoryPage({ params }) {
  const category = categoryBySlug((await params).category);
  if (!category) notFound();
  const products = (await getProducts()).filter((p) => p.category === category.value);

  return (
    <div className="container-x py-8 md:py-12">
      <div className="overflow-hidden rounded-3xl bg-sand">
        <Image src={BANNERS[category.value]} alt={`${category.label} collection`} priority placeholder="blur" sizes="(min-width: 1320px) 1240px, 100vw" className="block h-auto w-full" />
      </div>
      <CategoryView title={category.label} products={products} />
    </div>
  );
}
