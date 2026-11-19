import { useState } from "react";

const TABS = {
  Description: [
    "A versatile everyday piece cut from soft, durable fabric with a relaxed fit that layers easily. Designed to move with you from morning commute to weekend plans.",
    "Finished with clean seams and considered details, it pairs just as well with tailored trousers as it does with your favourite denim.",
  ],
  "Care guide": [
    "Machine wash cold on a gentle cycle with similar colours. Do not bleach.",
    "Tumble dry low or lay flat to dry. Cool iron if needed. Do not dry clean.",
  ],
  "Size guide": [
    "Fits true to size. If you're between sizes, we recommend sizing up for a more relaxed fit.",
    "Model is 5'9\" / 175cm and wears a size S.",
  ],
};

export default function ProductDescription() {
  const [tab, setTab] = useState("Description");

  return (
    <section className="mt-20 border-t border-line pt-10">
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line">
        {Object.keys(TABS).map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition ${
              tab === name ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="max-w-3xl space-y-4 py-8 leading-relaxed text-ink/75">
        {TABS[tab].map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
