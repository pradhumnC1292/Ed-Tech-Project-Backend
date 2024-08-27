import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";

import { errorMiddleware } from "./src/middleware/error.js";
import { connectDB } from "./src/config/database.js";
import userRoutes from "./src/routes/userRoutes.js";
import coursesRoutes from "./src/routes/coursesRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));

// connections
connectDB();

app.get("/", (req, res) => {
  res.send("Server is listening");
});

app.use(errorMiddleware);

app.use("/api", userRoutes);
app.use("/api", coursesRoutes);
app.use("/api", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`);
});
