"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		throw new Error("Email and password are required");
	}

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Login failed");
	}

	// Get cookie from server response
	const setCookieHeader = response.headers.get("set-cookie");
	if (setCookieHeader) {
		// Set cookie on server
		const cookieStore = await cookies();
		const cookieParts = setCookieHeader.split(";");
		const [nameValue] = cookieParts;
		const [name, value] = nameValue.split("=");

		cookieStore.set(name, value, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
			path: "/",
		});
	}

	// Force cache revalidation to update Header
	revalidatePath("/");

	// Redirect to home page (outside try/catch)
	redirect("/");
}

export async function logoutAction() {
	// Call logout API (ignore errors)
	try {
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
			method: "POST",
			credentials: "include",
		});
	} catch {
		// Ignore API errors
	}

	// Clear cookie on server
	const cookieStore = await cookies();
	cookieStore.delete("auth_token");

	// Force cache revalidation to update Header
	revalidatePath("/");

	// Redirect to login page (outside try/catch)
	redirect("/login");
}
