import { getFeatureFlags } from "@/lib/flags";
import AdminPanel from "@/components/AdminPanel";

export default async function DashboardPage() {
	const flags = await getFeatureFlags();

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Dashboard</h1>

			{flags.showAdminDashboard ? (
				<AdminPanel />
			) : (
				<div className="bg-gray-100 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Regular Dashboard</h2>
					<p>Welcome to your dashboard! You have standard user access.</p>
				</div>
			)}
		</div>
	);
}
