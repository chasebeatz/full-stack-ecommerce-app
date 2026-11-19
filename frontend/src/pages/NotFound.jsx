import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-medium md:text-5xl">Page not found</h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn-dark mt-8">Back to shop</Link>
    </div>
  );
}
