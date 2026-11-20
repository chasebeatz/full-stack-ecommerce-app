import Link from "next/link";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";
import offerImg from "@/assets/banneroffer.png";

export default function Offer() {
  return (
    <section className="container-x pt-20 md:pt-28">
      <div className="relative overflow-hidden rounded-[28px] bg-[#e8e8f3]">
        <Image src={offerImg} alt="" fill sizes="(min-width: 1320px) 1240px, 100vw" className="object-cover object-right opacity-60 sm:opacity-100" />
        <div className="relative px-6 py-16 sm:px-12 md:py-24 lg:px-16">
          <span className="chip">Limited time</span>
          <h2 className="mt-5 max-w-lg text-4xl font-medium leading-[1.05] md:text-6xl">
            Summer sale <span className="text-accent-dark">up to 50% off</span>
          </h2>
          <p className="mt-4 max-w-sm text-ink/70">Seasonal favourites at their lowest prices — while stock lasts.</p>
          <Link href="/mens" className="btn-dark group mt-8 px-8 py-4">
            Shop the sale
            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
