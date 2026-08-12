import { Router } from "express";

import {
    getSalesReport,
    getLowStockReport,
    getStockMovementReport
} from "../controllers/reportController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// ==========================================
// SALES REPORT
// GET /api/reports/sales
// ==========================================

router.get(
    "/sales",
    authenticate,
    getSalesReport
);

// ==========================================
// LOW STOCK REPORT
// GET /api/reports/low-stock
// ==========================================

router.get(
    "/low-stock",
    authenticate,
    getLowStockReport
);

// ==========================================
// STOCK MOVEMENT REPORT
// GET /api/reports/stock-movements
// ==========================================

router.get(
    "/stock-movements",
    authenticate,
    getStockMovementReport
);

export default router;