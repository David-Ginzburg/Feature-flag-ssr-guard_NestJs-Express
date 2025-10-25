import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	output: "standalone",
	experimental: {
		serverComponentsExternalPackages: [],
	},
};

export default nextConfig;
