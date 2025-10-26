import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

let getFlagsCallCount = 0;

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;

			if (!email || !password || !role) {
				return res.status(400).json({
					error: "Missing fields",
					message: "Please fill in email, password and select role",
				});
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({
					error: "Invalid email",
					message: "Please enter a valid email address",
				});
			}

			if (password.length < 6) {
				return res.status(400).json({
					error: "Password too short",
					message: "Password must be at least 6 characters long",
				});
			}

			console.log("Registration attempt:", { email, role });
			const user = await AuthService.register(email, password, role as Role);
			res.status(201).json({
				...user,
				message: "Registration successful!",
			});
		} catch (error: any) {
			console.error("Registration error:", error);

			if (error.code === "P2002") {
				return res.status(409).json({
					error: "User already exists",
					message:
						"User with this email is already registered. Try logging in or use a different email.",
				});
			}

			if (error.message?.includes("Invalid role")) {
				return res.status(400).json({
					error: "Invalid role",
					message: "Please select one of the available roles: VIEWER, EDITOR, ADMIN",
				});
			}

			res.status(500).json({
				error: "Server error",
				message: "An unexpected error occurred. Please try again later.",
			});
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({
					error: "Missing fields",
					message: "Please enter email and password",
				});
			}

			const user = await AuthService.login(email, password);
			const token = AuthService.generateToken(user.id);

			console.log("Login successful - returning token in response body (no cookie set)");
			res.json({
				...user,
				token,
				message: "Login successful!",
			});
		} catch (error: any) {
			console.error("Login error:", error);

			if (error.message === "Invalid credentials") {
				return res.status(401).json({
					error: "Invalid credentials",
					message: "Invalid email or password. Please check your credentials.",
				});
			}

			res.status(500).json({
				error: "Server error",
				message: "An unexpected error occurred. Please try again later.",
			});
		}
	}

	static async me(req: Request, res: Response) {
		if (!req.user) {
			return res.status(401).json({
				error: "Unauthorized",
				message: "You must be logged in to access this page",
			});
		}
		res.json(req.user);
	}

	static async getFlags(req: Request, res: Response) {
		getFlagsCallCount++;

		const userInfo = req.user ? `${req.user.role} (${req.user.email})` : "anonymous";

		console.log(
			`[getFlags] Call #${getFlagsCallCount} by: ${userInfo} at ${new Date().toISOString()}`
		);
		console.log(`[getFlags] Token: ${req.user?.id || "anonymous"}`);
		console.log(
			`[getFlags] Auth header: ${
				req.headers.authorization
					? "Bearer " + req.headers.authorization.substring(7, 27) + "..."
					: "none"
			}`
		);

		const userRole = req.user ? req.user.role : "anonymous";
		const userId = req.user ? req.user.id : "anonymous";

		const currentETag = `"${userId}-${userRole}"`;

		if (req.headers["if-none-match"] === currentETag) {
			return res.status(304).send();
		}

		const flags = req.user
			? AuthService.getFeatureFlags(req.user.role as Role)
			: {
					canViewAnalytics: false,
					canEditContent: false,
					showAdminDashboard: false,
					canAccessSettings: false,
			  };

		console.log(`[getFlags] Returning flags:`, flags);

		res.setHeader("Cache-Control", "private, max-age=60");
		res.setHeader("ETag", `"${req.user?.id || "anonymous"}-${Math.floor(Date.now() / 60000)}"`);

		res.json(flags);
	}

	static async logout(req: Request, res: Response) {
		res.clearCookie("auth_token", {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? "strict" : "lax",
			path: "/",
		});

		res.json({ message: "Logout successful" });
	}
}
