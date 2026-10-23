import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"] as const;
required.forEach((k) => { if (!process.env[k]) throw new Error(`Missing env variable: ${k}`); });

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL!,
  isProd: process.env.NODE_ENV === "production",
};