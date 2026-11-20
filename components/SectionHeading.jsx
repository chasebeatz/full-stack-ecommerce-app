import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

export default function SectionHeading({ eyebrow, title, href, linkLabel = "View all" }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl font-medium md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 text-sm font-semibold text-ink">
          {linkLabel}
          <HiArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
