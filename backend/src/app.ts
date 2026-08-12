import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import customerRoutes from "./routes/customerRoutes";
import productRoutes from "./routes/productRoutes";
import challanRoutes from "./routes/challanRoutes";
import stockMovementRoutes from "./routes/stockMovementRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import reportRoutes from "./routes/reportRoutes";

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/products", productRoutes);

app.use("/api/challans", challanRoutes);

app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FundsRoom ERP API is running",
        database: "connected",
        time: new Date().toISOString()
    });
});

// ===============================
// 404 HANDLER
// MUST BE AFTER ALL ROUTES
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ===============================
// EXPORT
// ===============================

export default app;