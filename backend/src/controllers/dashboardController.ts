import { Request, Response } from "express";
import pool from "../config/database";

export const getDashboardStats = async (
    req: Request,
    res: Response
) => {
    try {
        const customersResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM customers`
        );

        const productsResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM products`
        );

        const challansResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM challans`
        );

        const movementsResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM stock_movements`
        );

        const lowStockResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM products
             WHERE current_stock <= 5`
        );

        res.status(200).json({
            success: true,
            dashboard: {
                total_customers:
                    customersResult.rows[0].total,

                total_products:
                    productsResult.rows[0].total,

                total_challans:
                    challansResult.rows[0].total,

                total_stock_movements:
                    movementsResult.rows[0].total,

                low_stock_products:
                    lowStockResult.rows[0].total
            }
        });

    } catch (error: any) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics",
            error: error.message
        });
    }
};