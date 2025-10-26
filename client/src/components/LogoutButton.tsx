"use client";

import { useState } from "react";
import Spinner from "./Spinner";

interface LogoutButtonProps {
	userRole: string;
}

export default function LogoutButton({ userRole }: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);

		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
				method: "POST",
				credentials: "include",
			});

			window.location.href = "/login";
		} catch (error) {
			console.error("Logout error:", error);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center space-x-4">
			<span className="text-sm text-gray-600">
				{userRole} •{" "}
				<button
					onClick={handleLogout}
					disabled={isLoading}
					className="text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{isLoading ? (
						<>
							<Spinner size="sm" className="mr-1" />
							Logout...
						</>
					) : (
						"Logout"
					)}
				</button>
			</span>
		</div>
	);
}
