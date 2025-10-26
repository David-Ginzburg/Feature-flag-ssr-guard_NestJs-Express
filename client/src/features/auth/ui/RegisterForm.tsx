"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { registerUser } from "@/entities/user";

export default function RegisterForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("VIEWER");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const result = await registerUser({ email, password, role });

		if (result.success) {
			router.push("/login");
		} else {
			setError(result.error || "Registration failed");
		}

		setIsLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6">Register</h1>
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
				<select
					value={role}
					onChange={(e) => setRole(e.target.value)}
					className="w-full p-3 border rounded mb-4"
				>
					<option value="VIEWER">Viewer</option>
					<option value="EDITOR">Editor</option>
					<option value="ADMIN">Admin</option>
				</select>
				<Button type="submit" loading={isLoading} disabled={isLoading} className="w-full">
					Register
				</Button>
				<p className="text-center mt-4">
					<a
						href="/login"
						className={`text-blue-500 ${
							isLoading ? "pointer-events-none opacity-50" : "hover:underline"
						}`}
					>
						Login
					</a>
				</p>
			</form>
		</div>
	);
}
