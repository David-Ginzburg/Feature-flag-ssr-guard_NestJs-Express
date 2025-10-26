import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: string;
			};
		}
	}
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let token = req.headers.authorization;
		if (token && token.startsWith("Bearer ")) {
			token = token.substring(7);
		} else {
			token = req.cookies.auth_token;
		}

		if (!token) return next();

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, email: true, role: true },
		});

		if (user) req.user = user;
		next();
	} catch (error) {
		next();
	}
};
