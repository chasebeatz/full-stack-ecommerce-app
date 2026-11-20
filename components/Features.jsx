import { HiOutlineTruck, HiOutlineRefresh, HiOutlineShieldCheck, HiOutlineChatAlt2 } from "react-icons/hi";

const ITEMS = [
  [HiOutlineTruck, "Free shipping", "On all orders over $75"],
  [HiOutlineRefresh, "30-day returns", "No questions asked"],
  [HiOutlineShieldCheck, "Pay on delivery", "Nothing to pay up front"],
  [HiOutlineChatAlt2, "Real support", "Here 7 days a week"],
];

export default function Features() {
  return (
    <section className="container-x py-12 md:py-16">
      <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {ITEMS.map(([Icon, title, text]) => (
          <li key={title} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-accent-dark shadow-soft">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
