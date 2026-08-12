import { Request, Response } from "express";
import pool from "../config/database";

// ==========================================
// SALES REPORT
// ==========================================

export const getSalesReport = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(`
            SELECT
                c.id,
                c.challan_number,
                c.customer_id,
                cu.name AS customer_name,
                c.created_at
            FROM challans c
            LEFT JOIN customers cu
                ON c.customer_id = cu.id
            ORDER BY c.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            report: result.rows
        });

    } catch (error: any) {
        console.error("Sales report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate sales report"
        });
    }
};

// ==========================================
// LOW STOCK REPORT
// ==========================================

export const getLowStockReport = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                sku,
                current_stock
            FROM products
            WHERE current_stock <= 5
            ORDER BY current_stock ASC
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (error: any) {
        console.error("Low stock report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate low stock report"
        });
    }
};

// ==========================================
// STOCK MOVEMENT REPORT
// ==========================================

export const getStockMovementReport = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(`
            SELECT
                sm.id,
                sm.product_id,
                p.name AS product_name,
                p.sku,
                sm.quantity,
                sm.movement_type,
                sm.reason,
                sm.created_by,
                sm.created_at
            FROM stock_movements sm
            LEFT JOIN products p
                ON sm.product_id = p.id
            ORDER BY sm.created_at DESC
        `);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            movements: result.rows
        });

    } catch (error: any) {
        console.error("Stock movement report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate stock movement report"
        });
    }
};