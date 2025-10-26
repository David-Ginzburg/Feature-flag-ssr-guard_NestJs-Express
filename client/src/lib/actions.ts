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

	// Получаем cookie из ответа сервера
	const setCookieHeader = response.headers.get("set-cookie");
	if (setCookieHeader) {
		// Устанавливаем cookie на сервере
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

	// Принудительно обновляем кэш для обновления Header
	revalidatePath("/");

	// Редирект на главную страницу (вне try/catch)
	redirect("/");
}

export async function logoutAction() {
	// Вызываем API logout (игнорируем ошибки)
	try {
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
			method: "POST",
			credentials: "include",
		});
	} catch {
		// Игнорируем ошибки API
	}

	// Очищаем cookie на сервере
	const cookieStore = await cookies();
	cookieStore.delete("auth_token");

	// Принудительно обновляем кэш для обновления Header
	revalidatePath("/");

	// Редирект на страницу входа (вне try/catch)
	redirect("/login");
}
