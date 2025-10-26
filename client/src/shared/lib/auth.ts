import { cookies } from "next/headers";

export async function getCurrentUser() {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get("auth_token");

		if (!authToken) {
			return null;
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
			headers: {
				Cookie: `auth_token=${authToken.value}`,
				Authorization: `Bearer ${authToken.value}`,
			},
			cache: "no-store",
		});

		if (response.ok) {
			return await response.json();
		}
	} catch {}

	return null;
}
