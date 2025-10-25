import { cookies } from "next/headers";

export async function getFeatureFlags() {
	"use cache: private";

	const cookieStore = cookies();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
	});

	if (!response.ok) {
		return {
			canViewAnalytics: false,
			canEditContent: false,
			showAdminDashboard: false,
			canAccessSettings: false,
		};
	}

	return await response.json();
}
