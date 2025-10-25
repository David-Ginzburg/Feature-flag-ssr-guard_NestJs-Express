"use client";

import { useEffect } from "react";

export default function LogoutPage() {
	useEffect(() => {
		// Вызываем API logout для очистки cookie на сервере
		const logout = async () => {
			try {
				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
					method: "POST",
					credentials: "include",
				});
			} catch (error) {
				console.error("Logout error:", error);
			} finally {
				// Принудительно обновляем страницу
				window.location.href = "/";
			}
		};

		logout();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Выход из системы...</h1>
				<p>Вы будете перенаправлены на главную страницу.</p>
			</div>
		</div>
	);
}
