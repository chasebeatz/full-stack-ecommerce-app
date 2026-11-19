import { Link } from "react-router";
import { BsFacebook, BsInstagram, BsTwitterX, BsPinterest } from "react-icons/bs";

const COLUMNS = [
  { title: "Shop", links: [["Men", "/mens"], ["Women", "/womens"], ["Kids", "/kids"], ["New arrivals", "/"]] },
  { title: "Help", links: [["Shipping", "/"], ["Returns", "/"], ["Size guide", "/"], ["Contact us", "/"]] },
  { title: "Company", links: [["About", "/"], ["Careers", "/"], ["Privacy policy", "/"], ["Terms", "/"]] },
];

const SOCIALS = [
  [BsInstagram, "Instagram"],
  [BsFacebook, "Facebook"],
  [BsTwitterX, "X"],
  [BsPinterest, "Pinterest"],
];

export function MyFooter() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link to="/" className="inline-flex rounded-lg bg-white px-3 py-2">
            <img src="/assets/logo.svg" alt="Shoppee" className="h-7" />
          </Link>
          <p className="mt-5 text-sm leading-relaxed">
            Everyday pieces made to last. Thoughtfully designed clothing for the whole family.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(([Icon, label]) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-accent hover:bg-accent hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{col.title}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Shoppee. All rights reserved.</p>
          <p>Secure payments · Visa · Mastercard · PayPal</p>
        </div>
      </div>
    </footer>
  );
}
