/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @react-pdf/renderer (uses canvas/canvas-based APIs)
  webpack: (config, { isServer }) => {
    // Exclude canvas from client bundle (pdf renderer handles it internally)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
