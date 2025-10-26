export interface FeatureFlags {
	canViewAnalytics: boolean;
	canEditContent: boolean;
	showAdminDashboard: boolean;
	canAccessSettings: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
	canViewAnalytics: false,
	canEditContent: false,
	showAdminDashboard: false,
	canAccessSettings: false,
};
