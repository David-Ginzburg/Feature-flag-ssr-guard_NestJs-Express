import { Suspense } from "react";
import { getFeatureFlags } from "@/lib/flags";
import AnalyticsWidget from "@/components/AnalyticsWidget";

async function FeatureFlagsContent() {
	const flags = await getFeatureFlags();

	return (
		<>
			{flags.canViewAnalytics && <AnalyticsWidget />}

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Available Features:</h2>
				<ul className="space-y-2">
					<li>Analytics: {flags.canViewAnalytics ? "✅" : "❌"}</li>
					<li>Content Editing: {flags.canEditContent ? "✅" : "❌"}</li>
					<li>Admin Dashboard: {flags.showAdminDashboard ? "✅" : "❌"}</li>
					<li>Settings Access: {flags.canAccessSettings ? "✅" : "❌"}</li>
				</ul>
			</div>
		</>
	);
}

export default function HomePage() {
	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Welcome to Feature Flags Demo</h1>

			<Suspense fallback={<div>Loading feature flags...</div>}>
				<FeatureFlagsContent />
			</Suspense>
		</div>
	);
}
