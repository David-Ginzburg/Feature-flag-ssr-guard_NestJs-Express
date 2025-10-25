import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;

			// Валидация входных данных
			if (!email || !password || !role) {
				return res.status(400).json({
					error: "Не все поля заполнены",
					message: "Пожалуйста, заполните email, пароль и выберите роль",
				});
			}

			// Валидация email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({
					error: "Некорректный email",
					message: "Пожалуйста, введите корректный email адрес",
				});
			}

			// Валидация пароля
			if (password.length < 6) {
				return res.status(400).json({
					error: "Слишком короткий пароль",
					message: "Пароль должен содержать минимум 6 символов",
				});
			}

			console.log("Registration attempt:", { email, role });
			const user = await AuthService.register(email, password, role as Role);
			res.status(201).json({
				...user,
				message: "Регистрация прошла успешно!",
			});
		} catch (error: any) {
			console.error("Registration error:", error);

			// Обработка конкретных ошибок
			if (error.code === "P2002") {
				return res.status(409).json({
					error: "Пользователь уже существует",
					message:
						"Пользователь с таким email уже зарегистрирован. Попробуйте войти в систему или используйте другой email.",
				});
			}

			if (error.message?.includes("Invalid role")) {
				return res.status(400).json({
					error: "Некорректная роль",
					message: "Выберите одну из доступных ролей: VIEWER, EDITOR, ADMIN",
				});
			}

			res.status(500).json({
				error: "Ошибка сервера",
				message: "Произошла непредвиденная ошибка. Попробуйте позже.",
			});
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			// Валидация входных данных
			if (!email || !password) {
				return res.status(400).json({
					error: "Не все поля заполнены",
					message: "Пожалуйста, введите email и пароль",
				});
			}

			const user = await AuthService.login(email, password);
			const token = AuthService.generateToken(user.id);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.json({
				...user,
				message: "Вход выполнен успешно!",
			});
		} catch (error: any) {
			console.error("Login error:", error);

			if (error.message === "Invalid credentials") {
				return res.status(401).json({
					error: "Неверные данные",
					message: "Неверный email или пароль. Проверьте правильность введенных данных.",
				});
			}

			res.status(500).json({
				error: "Ошибка сервера",
				message: "Произошла непредвиденная ошибка. Попробуйте позже.",
			});
		}
	}

	static async me(req: Request, res: Response) {
		if (!req.user) {
			return res.status(401).json({
				error: "Не авторизован",
				message: "Для доступа к этой странице необходимо войти в систему",
			});
		}
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

	static async logout(req: Request, res: Response) {
		// Очищаем cookie на сервере
		res.clearCookie("auth_token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		});

		res.json({ message: "Выход выполнен успешно" });
	}
}
