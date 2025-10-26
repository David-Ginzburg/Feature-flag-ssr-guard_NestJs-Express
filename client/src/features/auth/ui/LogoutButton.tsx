"use client";

import { useState } from "react";
import { Spinner } from "@/shared/ui";
import { logoutUser } from "@/entities/user";
import { UserRole } from "@/entities/user";

interface LogoutButtonProps {
	userRole: UserRole;
}

export default function LogoutButton({ userRole }: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);

		try {
			await logoutUser();
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
