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
		if (!process.env.FRONTEND_URL) {
			throw new Error("FRONTEND_URL environment variable is required in production");
		}
		return process.env.FRONTEND_URL;
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
