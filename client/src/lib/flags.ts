import { cookies } from "next/headers";

export async function getFeatureFlags() {
	"use cache: private";

	const cookieStore = await cookies();
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/flags`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
		cache: "no-store", // Отключаем кеширование
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
