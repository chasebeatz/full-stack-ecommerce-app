"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineClipboardList } from "react-icons/hi";

const LINKS = [
  { href: "/admin/products", label: "All products", Icon: HiOutlineViewGrid },
  { href: "/admin/products/new", label: "Add product", Icon: HiOutlinePlusCircle },
  { href: "/admin/orders", label: "Orders", Icon: HiOutlineClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-line px-4 py-3 sm:px-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-10">
      <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:block">Store</p>
      <nav className="flex gap-2 lg:flex-col">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:gap-3 lg:flex-none lg:justify-start ${
                active ? "bg-ink text-white" : "text-ink/70 hover:bg-sand hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden xs:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
