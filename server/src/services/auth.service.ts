import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export class AuthService {
	static async register(email: string, password: string, role: Role) {
		// Валидация роли
		if (!Object.values(Role).includes(role)) {
			throw new Error("Invalid role");
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		return await prisma.user.create({
			data: { email, password: hashedPassword, role },
			select: { id: true, email: true, role: true },
		});
	}

	static async login(email: string, password: string) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new Error("Invalid credentials");
		}
		return { id: user.id, email: user.email, role: user.role };
	}

	static generateToken(userId: string): string {
		return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
	}

	static getFeatureFlags(role: Role) {
		const flags = {
			canViewAnalytics: role === "ADMIN" || role === "EDITOR" || role === "VIEWER",
			canEditContent: role === "ADMIN" || role === "EDITOR",
			showAdminDashboard: role === "ADMIN",
			canAccessSettings: role === "ADMIN" || role === "EDITOR",
		};
		return flags;
	}
}
