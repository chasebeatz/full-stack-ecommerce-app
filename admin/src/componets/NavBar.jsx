import logo from "../assets/logo.svg";
import { HiOutlineLogout } from "react-icons/hi";
import { logout } from "../lib/api";

export default function NavBar({ user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Shoppee" className="h-8" />
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold uppercase text-white">{user.name.charAt(0)}</span>
          <button onClick={logout} className="btn-outline px-3 py-2" aria-label="Sign out" title="Sign out">
            <HiOutlineLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
