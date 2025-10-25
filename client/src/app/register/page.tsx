"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("VIEWER");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, role }),
			});

			if (response.ok) {
				router.push("/login");
			} else {
				setError("Registration failed");
			}
		} catch (err) {
			setError("Registration failed");
		}
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
				<button type="submit" className="w-full bg-blue-500 text-white p-3 rounded">
					Register
				</button>
				<p className="text-center mt-4">
					<a href="/login" className="text-blue-500">
						Login instead
					</a>
				</p>
			</form>
		</div>
	);
}
