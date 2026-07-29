/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async rewrites() {
    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) return [];
    const api = fastApiUrl.replace(/\/$/, "");

    return {
      beforeFiles: [
        { source: "/api/club-data", destination: `${api}/api/club-data` },
        { source: "/api/admin/live-data", destination: `${api}/api/admin/live-data` },
        { source: "/api/admin/tournament-registrations", destination: `${api}/api/admin/tournament-registrations` },
        { source: "/api/admin/tournament-registrations/:path*", destination: `${api}/api/admin/tournament-registrations/:path*` },
        { source: "/api/tournament-registrations", destination: `${api}/api/tournament-registrations` },
        { source: "/api/auth/login", destination: `${api}/api/auth/login` },
        { source: "/api/auth/logout", destination: `${api}/api/auth/logout` },
        { source: "/api/auth/session", destination: `${api}/api/auth/session` },
        { source: "/api/profile", destination: `${api}/api/profile` },
        { source: "/api/payments/checkout", destination: `${api}/api/payments/checkout` },
        { source: "/api/import/kolky", destination: `${api}/api/import/kolky` }
      ]
    };
  }
};

export default nextConfig;
