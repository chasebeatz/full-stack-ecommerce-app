import { Link } from "react-router";
import { HiChevronRight } from "react-icons/hi";

const CATEGORY_ROUTES = { men: ["Men", "/mens"], women: ["Women", "/womens"], kid: ["Kids", "/kids"] };

export default function ProductHd({ product }) {
  const [label, to] = CATEGORY_ROUTES[product.category] || ["Shop", "/"];
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted">
      <Link to="/" className="hover:text-ink">Home</Link>
      <HiChevronRight className="h-4 w-4" />
      <Link to={to} className="hover:text-ink">{label}</Link>
      <HiChevronRight className="h-4 w-4" />
      <span className="line-clamp-1 text-ink">{product.name}</span>
    </nav>
  );
}
