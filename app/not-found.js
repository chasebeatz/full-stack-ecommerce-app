import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.svg";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <Link href="/" className="inline-block">
          <Image src={logo} alt="Shoppee" className="mx-auto h-9 w-auto" priority />
        </Link>
        <p className="eyebrow mt-12">404</p>
        <h1 className="mt-3 text-4xl font-medium md:text-5xl">Page not found</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn-dark mt-8">Back to shop</Link>
      </div>
    </div>
  );
}
