"use client";

import Link from "next/link";
import Image from "next/image";
import { HiOutlineLogout, HiOutlineExternalLink } from "react-icons/hi";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/context/AuthContext";

export default function AdminNav({ user }) {
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src={logo} alt="Shoppee" className="h-8 w-auto" priority />
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-sand hover:text-ink sm:flex">
            View store <HiOutlineExternalLink className="h-4 w-4" />
          </Link>
          <div className="hidden text-right md:block">
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
