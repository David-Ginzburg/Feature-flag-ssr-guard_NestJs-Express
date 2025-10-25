import Link from "next/link";

export default function Header() {
	return (
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
					<Link
						href="/login"
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Login
					</Link>
				</nav>
			</div>
		</header>
	);
}
