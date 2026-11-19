import { Link } from "react-router";
import { HiArrowRight, HiStar } from "react-icons/hi";
import heroImg from "../assets/bgecom.png";

export default function Hero() {
  return (
    <section className="container-x pt-4 md:pt-6">
      <div className="relative overflow-hidden rounded-[28px] bg-sand">
        <img
          src={heroImg}
          alt="Woman in a pink coat carrying shopping bags"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        {/* readability wash on small screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e9e4e8]/95 via-[#e9e4e8]/70 to-transparent md:via-[#e9e4e8]/30" />

        <div className="relative flex min-h-[560px] items-center px-6 py-16 sm:px-12 md:min-h-[640px] lg:px-16">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow">New season · Autumn / Winter</p>
            <h1 className="mt-5 text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
              Dress for the
              <br />
              <em className="font-normal text-accent-dark">life</em> you live.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 md:text-lg">
              Comfortable, considered essentials for men, women and kids — at prices that make sense.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/womens" className="btn-dark group px-8 py-4">
                Shop women
                <HiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/mens" className="btn-ghost px-8 py-4">
                Shop men
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="text-ink/70">
                <span className="font-semibold text-ink">4.9/5</span> from 198k+ happy customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
