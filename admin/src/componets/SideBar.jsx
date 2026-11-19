import { NavLink } from "react-router";
import { HiOutlineViewGrid, HiOutlinePlusCircle } from "react-icons/hi";

const LINKS = [
  { to: "/listproduct", label: "All products", Icon: HiOutlineViewGrid },
  { to: "/addproduct", label: "Add product", Icon: HiOutlinePlusCircle },
];

export default function SideBar() {
  return (
    <aside className="border-b border-line px-4 py-3 sm:px-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-10">
      <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:block">Catalogue</p>
      <nav className="flex gap-2 lg:flex-col">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:flex-none lg:justify-start ${
                isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-sand hover:text-ink"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
