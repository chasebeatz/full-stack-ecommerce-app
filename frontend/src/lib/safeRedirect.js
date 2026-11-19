// Only allow same-site paths like "/checkout" — never "//evil.com" or "https://...".
export const safeRedirect = (path) => (typeof path === "string" && /^\/(?!\/)/.test(path) ? path : "/");
