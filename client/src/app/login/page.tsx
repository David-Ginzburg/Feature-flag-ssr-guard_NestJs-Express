"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				// Принудительно обновляем страницу для обновления Server Components
				window.location.href = "/";
			} else {
				const errorData = await response.json();
				setError(errorData.message || "Invalid credentials");
			}
		} catch (err) {
			setError("Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6">Login</h1>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 border rounded mb-4"
					required
				/>
				<button 
					type="submit" 
					disabled={isLoading}
					className="w-full bg-blue-500 text-white p-3 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{isLoading ? (
						<>
							<Spinner size="sm" className="mr-2" />
							Вход...
						</>
					) : (
						"Login"
					)}
				</button>
				<p className="text-center mt-4">
					<a href="/register" className="text-blue-500">
						Register instead
					</a>
				</p>
			</form>
		</div>
	);
}
