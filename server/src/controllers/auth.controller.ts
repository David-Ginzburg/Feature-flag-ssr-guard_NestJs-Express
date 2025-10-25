import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;
			const user = await AuthService.register(email, password, role as Role);
			res.status(201).json(user);
		} catch (error) {
			res.status(400).json({ error: "Registration failed" });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const user = await AuthService.login(email, password);
			const token = AuthService.generateToken(user.id);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.json(user);
		} catch (error) {
			res.status(401).json({ error: "Invalid credentials" });
		}
	}

	static async me(req: Request, res: Response) {
		res.json(req.user);
	}

	static async getFlags(req: Request, res: Response) {
		const flags = req.user
			? AuthService.getFeatureFlags(req.user.role as Role)
			: {
					canViewAnalytics: false,
					canEditContent: false,
					showAdminDashboard: false,
					canAccessSettings: false,
			  };
		res.json(flags);
	}
}