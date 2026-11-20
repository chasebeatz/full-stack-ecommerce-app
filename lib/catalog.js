// URL slug -> category stored in the database
export const CATEGORIES = [
  { slug: "womens", value: "women", label: "Women" },
  { slug: "mens", value: "men", label: "Men" },
  { slug: "kids", value: "kid", label: "Kids" },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByValue = (value) => CATEGORIES.find((c) => c.value === value);
