import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardWrapper() {
	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Dashboard</h1>
			<Suspense fallback={<div>Loading dashboard...</div>}>
				<DashboardContent />
			</Suspense>
		</div>
	);
}
