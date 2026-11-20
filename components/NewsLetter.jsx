"use client";

import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";

export default function NewsLetter() {
  const [done, setDone] = useState(false);

  return (
    <section className="container-x pb-24">
      <div className="rounded-[28px] bg-sand px-6 py-16 text-center sm:px-12 md:py-20">
        <p className="eyebrow">Members get more</p>
        <h2 className="mx-auto mt-4 max-w-xl text-3xl font-medium md:text-5xl">Get 10% off your first order</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Use code <span className="font-semibold text-ink">WELCOME10</span> at checkout. Sign up below to hear about new drops first.
        </p>
        {done ? (
          <p role="status" className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium shadow-soft">
            <HiCheckCircle className="h-5 w-5 text-green-600" /> You&apos;re on the list. See you soon!
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" required placeholder="you@example.com" className="input h-[52px] flex-1 rounded-full px-6" />
            <button className="btn-dark h-[52px] px-8">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}
