import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? [
					process.env.FRONTEND_URL || "https://feature-flag-ssr-guard-nest-js-expr.vercel.app",
					"https://feature-flag-ssr-guard-nest-js-expr.vercel.app"
				]
				: "http://localhost:3030",
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
