import { cookies } from "next/headers";
import { FeatureFlags, defaultFeatureFlags } from "../model/types";

export async function getFeatureFlags(): Promise<FeatureFlags> {
	const cookieStore = await cookies();
	const authToken = cookieStore.get("auth_token");

	if (!authToken) {
		return defaultFeatureFlags;
	}

	try {
		console.log("Fetching flags for user with token:", authToken.value.substring(0, 20) + "...");

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
			headers: {
				Cookie: cookieStore.toString(),
				Authorization: `Bearer ${authToken.value}`,
			},
			next: { revalidate: 60 },
		});

		console.log("Response status:", response.status, "from cache:", response.headers);

		if (!response.ok) {
			return defaultFeatureFlags;
		}

		const flags = await response.json();
		console.log("Returning flags:", flags);
		return flags;
	} catch (error) {
		console.error("Failed to fetch feature flags:", error);
		return defaultFeatureFlags;
	}
}
