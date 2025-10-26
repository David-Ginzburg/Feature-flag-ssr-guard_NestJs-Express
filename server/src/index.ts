import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// Get allowed origins from environment variables
const getAllowedOrigins = () => {
	if (process.env.NODE_ENV === "production") {
		const origins = [];
		
		// Add FRONTEND_URL if provided
		if (process.env.FRONTEND_URL) {
			origins.push(process.env.FRONTEND_URL);
		}
		
		// Add VERCEL_URL if provided
		if (process.env.VERCEL_URL) {
			origins.push(`https://${process.env.VERCEL_URL}`);
		}
		
		// Add fallback Vercel domain if no environment variables are set
		if (origins.length === 0) {
			origins.push("https://feature-flag-ssr-guard-nest-js-expr.vercel.app");
		}
		
		return origins;
	}
	
	return "http://localhost:3030";
};

app.use(
	cors({
		origin: getAllowedOrigins(),
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Allowed CORS origins:`, getAllowedOrigins());
});
