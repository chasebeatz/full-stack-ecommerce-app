"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineUser, HiOutlineClipboardList, HiOutlineLogout, HiChevronDown, HiOutlineViewGrid } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) return <span className="hidden h-11 w-24 animate-pulse rounded-full bg-sand sm:block" aria-hidden />;

  if (!user) {
    return (
      <Link href="/login" className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand sm:flex">
        <HiOutlineUser className="h-5 w-5" /> Sign in
      </Link>
    );
  }

  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-cream";
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition hover:bg-sand"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold uppercase text-white">
          {user.name.charAt(0)}
        </span>
        <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
        <HiChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-soft">
          <div className="border-b border-line px-4 pb-3 pt-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" href="/orders" onClick={() => setOpen(false)} className={item}>
            <HiOutlineClipboardList className="h-5 w-5 text-muted" /> My orders
          </Link>
          {user.role === "admin" && (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className={item}>
              <HiOutlineViewGrid className="h-5 w-5 text-muted" /> Admin dashboard
            </Link>
          )}
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/");
            }}
            className={item}
          >
            <HiOutlineLogout className="h-5 w-5 text-muted" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
