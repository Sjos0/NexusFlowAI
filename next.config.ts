// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This configuration is specifically for the development environment where the app is hosted.
  // The wildcard '*.cloudworkstations.dev' allows requests from any subdomain of cloudworkstations.dev,
  // which is suitable for dynamic preview environments.
  experimental: {
    allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  },
  
  // By not explicitly setting `devIndicators` (e.g., `devIndicators: { buildActivity: false }`),
  // the Next.js development indicators remain enabled by default.
  // This ensures the user sees the useful overlay for errors and compilation status.

  // Retain other necessary configurations if they were previously present and are still needed.
  // For example:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
