import { Suspense } from "react";
import { getFeatureFlags } from "@/entities/feature-flag";

async function SettingsContent() {
	const flags = await getFeatureFlags();

	if (!flags.canAccessSettings) {
		return (
			<>
				<h1 className="text-3xl font-bold mb-8">Access Denied</h1>
				<p className="text-red-500">You don't have permission to access settings.</p>
			</>
		);
	}

	return (
		<>
			<h1 className="text-3xl font-bold mb-8">Settings</h1>
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">User Settings</h2>
				<p>Settings form would go here...</p>
			</div>
		</>
	);
}

export default function SettingsPage() {
	return (
		<div className="container mx-auto p-8">
			<Suspense fallback={<div>Loading settings...</div>}>
				<SettingsContent />
			</Suspense>
		</div>
	);
}
