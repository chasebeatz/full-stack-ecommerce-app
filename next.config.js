/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product photos live in Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  async redirects() {
    return [{ source: "/cart-page", destination: "/cart", permanent: true }];
  },
};

export default nextConfig;
