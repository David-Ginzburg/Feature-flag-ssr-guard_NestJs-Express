import { User } from "../model/types";

export async function getCurrentUser(): Promise<User | null> {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
			credentials: "include",
			cache: "no-store",
		});

		if (response.ok) {
			return await response.json();
		}
	} catch {}

	return null;
}

export async function registerUser(data: {
	email: string;
	password: string;
	role: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (response.ok) {
			return { success: true };
		} else {
			const errorData = await response.json();
			return { success: false, error: errorData.message || "Registration failed" };
		}
	} catch {
		return { success: false, error: "Registration failed" };
	}
}

export async function loginUser(data: {
	email: string;
	password: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (response.ok) {
			return { success: true };
		} else {
			const errorData = await response.json();
			return { success: false, error: errorData.message || "Login failed" };
		}
	} catch {
		return { success: false, error: "Login failed" };
	}
}

export async function logoutUser(): Promise<void> {
	try {
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
			method: "POST",
			credentials: "include",
		});
	} catch {
		// Ignore API errors
	}
}
