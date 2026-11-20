export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const cleanEmail = (v) => String(v || "").trim().toLowerCase();
// Only same-site paths like "/checkout"; never "//other-site.com".
export const safePath = (p) => (typeof p === "string" && /^\/(?!\/)/.test(p) ? p : "/");
export const isRateLimited = (error) => error?.status === 429 || error?.code === "over_email_send_rate_limit";
