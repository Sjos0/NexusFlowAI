
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // allowedDevOrigins should be a top-level property
  allowedDevOrigins: ['https://6000-firebase-studio-1749306014488.cluster-etsqrqvqyvd4erxx7qq32imrjk.cloudworkstations.dev'],
  devIndicators: {
    // allowedDevOrigins was previously here, it's removed from devIndicators
  },
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
