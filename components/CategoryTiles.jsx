import Link from "next/link";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";
import women from "@/assets/product_3.png";
import men from "@/assets/product_14.png";
import kids from "@/assets/product_27.png";

const TILES = [
  { href: "/womens", label: "Women", img: women, note: "Coats, knits & more" },
  { href: "/mens", label: "Men", img: men, note: "Jackets & everyday layers" },
  { href: "/kids", label: "Kids", img: kids, note: "Built for play" },
];

export default function CategoryTiles() {
  return (
    <section className="container-x pb-20">
      <div className="grid gap-4 sm:grid-cols-3 md:gap-6">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-sand sm:aspect-[3/4]">
            <Image
              src={t.img}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
              <div>
                <h3 className="text-3xl font-medium">{t.label}</h3>
                <p className="mt-1 text-sm text-white/80">{t.note}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition group-hover:bg-accent group-hover:text-white">
                <HiArrowRight />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
