import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/mens", label: "Men" },
  { to: "/womens", label: "Women" },
  { to: "/kids", label: "Kids" },
];

const linkClass = ({ isActive }) =>
  `relative py-1 text-sm font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-accent after:transition-all ${
    isActive ? "text-ink after:w-full" : "text-muted hover:text-ink after:w-0 hover:after:w-full"
  }`;

export default function Header() {
  const { getTotalCartItems } = useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const count = getTotalCartItems();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-ink py-2 text-center text-xs font-medium tracking-wide text-white/90">
        Free shipping on orders over $75 · Easy 30-day returns
      </div>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "border-line bg-cream/85 backdrop-blur-lg" : "border-transparent bg-cream"
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between md:h-20">
          <Link to="/" className="flex items-center gap-2" aria-label="Shoppee home">
            <img src="/assets/logo.svg" alt="" className="h-8 w-auto md:h-9" />
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand sm:flex"
            >
              <HiOutlineUser className="h-5 w-5" /> Sign in
            </Link>
            <Link
              to="/cart-page"
              className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand"
              aria-label={`Cart, ${count} items`}
            >
              <HiOutlineShoppingBag className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-cream">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand md:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <HiX className="h-6 w-6" /> : <HiOutlineMenuAlt3 className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* mobile menu */}
        <div
          className={`overflow-hidden border-t border-line bg-cream transition-[max-height] duration-300 md:hidden ${
            open ? "max-h-96" : "max-h-0 border-transparent"
          }`}
        >
          <ul className="container-x flex flex-col py-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 font-display text-xl ${isActive ? "text-accent-dark" : "text-ink"}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link to="/login" className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted">
                <HiOutlineUser className="h-5 w-5" /> Sign in / Create account
              </Link>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
}
