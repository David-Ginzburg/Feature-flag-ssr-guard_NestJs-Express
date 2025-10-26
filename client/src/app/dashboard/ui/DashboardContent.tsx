import { getFeatureFlags } from "@/entities/feature-flag";
import { AdminPanel } from "@/features/admin";
import AnalyticsWidget from "./AnalyticsWidget";

export default async function DashboardContent() {
	const flags = await getFeatureFlags();

	if (flags.showAdminDashboard) {
		return <AdminPanel />;
	}

	if (flags.canViewAnalytics) {
		return <AnalyticsWidget />;
	}

	return (
		<div className="bg-gray-100 p-6 rounded-lg">
			<h2 className="text-xl font-semibold mb-4">Regular Dashboard</h2>
			<p>Welcome to your dashboard! You have standard user access.</p>
		</div>
	);
}
