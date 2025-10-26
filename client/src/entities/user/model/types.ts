export interface User {
	id: string;
	email: string;
	role: "VIEWER" | "EDITOR" | "ADMIN";
	createdAt: string;
	updatedAt: string;
}

export type UserRole = User["role"];
