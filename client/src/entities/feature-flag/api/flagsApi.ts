import { cookies } from "next/headers";
import { FeatureFlags, defaultFeatureFlags } from "../model/types";

export async function getFeatureFlags(): Promise<FeatureFlags> {
	const cookieStore = await cookies();
	const authToken = cookieStore.get("auth_token");

	if (!authToken) {
		return defaultFeatureFlags;
	}

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
			headers: {
				Cookie: cookieStore.toString(),
				Authorization: `Bearer ${authToken.value}`,
			},
			next: { revalidate: 60 },
		});

		if (!response.ok) {
			return defaultFeatureFlags;
		}

		const flags = await response.json();
		return flags;
	} catch (error) {
		console.error("Failed to fetch feature flags:", error);
		return defaultFeatureFlags;
	}
}
