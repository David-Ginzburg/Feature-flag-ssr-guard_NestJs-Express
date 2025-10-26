import { Suspense } from "react";
import { getFeatureFlags } from "@/entities/feature-flag";
import FeatureFlagsList from "./ui/FeatureFlagsList";

async function FeatureFlagsContent() {
	const flags = await getFeatureFlags();

	return <FeatureFlagsList flags={flags} />;
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
