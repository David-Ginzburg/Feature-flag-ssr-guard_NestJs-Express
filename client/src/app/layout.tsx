import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUserServer } from "@/entities/user/api/userServer";
import { LogoutButton } from "@/features/auth";
import "./globals.css";

export const metadata: Metadata = {
	title: "Feature Flags Demo",
	description: "Full-stack app with server-side feature flags",
};

async function UserStatus() {
	const user = await getCurrentUserServer();

	if (!user) {
		return (
			<Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
				Login
			</Link>
		);
	}

	return <LogoutButton userRole={user.role} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<header className="bg-white shadow-sm border-b">
					<div className="container mx-auto px-4 py-4 flex justify-between items-center">
						<Link href="/" className="text-xl font-bold">
							Feature Flags Demo
						</Link>
						<nav className="space-x-4">
							<Link href="/" className="hover:text-blue-600">
								Home
							</Link>
							<Link href="/dashboard" className="hover:text-blue-600">
								Dashboard
							</Link>
							<Link href="/settings" className="hover:text-blue-600">
								Settings
							</Link>
							<Suspense
								fallback={<div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>}
							>
								<UserStatus />
							</Suspense>
						</nav>
					</div>
				</header>
				<main>{children}</main>
			</body>
		</html>
	);
}
