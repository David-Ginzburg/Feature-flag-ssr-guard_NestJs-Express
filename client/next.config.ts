import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	output: "standalone",
	serverExternalPackages: [],
};

export default nextConfig;
