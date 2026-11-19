import logo from "../assets/logo.svg";
import profileImg from "../assets/profile.png";

export default function NavBar() {
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
            <p className="text-sm font-semibold leading-tight">Store admin</p>
            <p className="text-xs text-muted">Shoppee</p>
          </div>
          <img src={profileImg} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}
