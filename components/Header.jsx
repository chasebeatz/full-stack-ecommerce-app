"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import logo from "@/assets/logo.svg";
import { useCart } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import AccountMenu from "./AccountMenu";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/mens", label: "Men" },
  { href: "/womens", label: "Women" },
  { href: "/kids", label: "Kids" },
];

export default function Header() {
  const { count, ready } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const close = () => setOpen(false);

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
          <Link href="/" onClick={close} className="flex items-center gap-2" aria-label="Shoppee home">
            <Image src={logo} alt="" className="h-8 w-auto md:h-9" priority />
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative py-1 text-sm font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-accent after:transition-all ${
                    isActive(item.href) ? "text-ink after:w-full" : "text-muted after:w-0 hover:text-ink hover:after:w-full"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <AccountMenu />
            <Link
              href="/cart"
              onClick={close}
              className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-sand"
              aria-label={`Bag, ${count} items`}
            >
              <HiOutlineShoppingBag className="h-6 w-6" />
              {ready && count > 0 && (
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
          className={`overflow-hidden border-t bg-cream transition-[max-height] duration-300 md:hidden ${
            open ? "max-h-[28rem] border-line" : "max-h-0 border-transparent"
          }`}
        >
          <ul className="container-x flex flex-col py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={`block rounded-lg px-3 py-3 font-display text-xl ${isActive(item.href) ? "text-accent-dark" : "text-ink"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li className="mt-2 border-t border-line pt-2">
                <p className="px-3 pt-2 text-xs text-muted">Signed in as {user.email}</p>
                <Link href="/orders" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-medium">My orders</Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-medium">Admin dashboard</Link>
                )}
                <button
                  onClick={async () => {
                    close();
                    await logout();
                    router.push("/");
                  }}
                  className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium"
                >
                  Sign out
                </button>
              </li>
            ) : (
              <li>
                <Link href="/login" onClick={close} className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted">
                  <HiOutlineUser className="h-5 w-5" /> Sign in / Create account
                </Link>
              </li>
            )}
          </ul>
        </div>
      </header>
    </>
  );
}
