import { Request, Response } from "express";
import pool from "../config/database";

// GET STOCK
export const getStock = async (
    req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                name,
                sku,
                category,
                current_stock,
                minimum_stock,
                warehouse_location,
                CASE
                    WHEN current_stock <= minimum_stock
                    THEN true
                    ELSE false
                END AS low_stock
             FROM products
             ORDER BY id DESC`
        );

        return res.status(200).json({
            success: true,
            products: result.rows
        });

    } catch (error: any) {
        console.error("GET STOCK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock",
            error: error.message
        });
    }
};


// UPDATE STOCK
export const updateStock = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { quantity, type } = req.body;

        if (
            quantity === undefined ||
            quantity === null ||
            !type
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity and type are required"
            });
        }

        if (!["IN", "OUT"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be IN or OUT"
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const productResult = await pool.query(
            `SELECT id, name, current_stock
             FROM products
             WHERE id = $1`,
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const currentStock =
            Number(productResult.rows[0].current_stock);

        const change =
            type === "IN"
                ? Number(quantity)
                : -Number(quantity);

        const newStock =
            currentStock + change;

        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        const result = await pool.query(
            `UPDATE products
             SET
                current_stock = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [newStock, id]
        );

        return res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            product: result.rows[0]
        });

    } catch (error: any) {
        console.error("UPDATE STOCK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update stock",
            error: error.message
        });
    }
};