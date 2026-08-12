import { Request, Response } from "express";
import pool from "../config/database";

// ==========================================
// CREATE STOCK MOVEMENT
// ==========================================

export const createStockMovement = async (
    req: Request,
    res: Response
) => {
    const client = await pool.connect();

    try {
        const {
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
        } = req.body;

        // Validate required fields
        if (
            !product_id ||
            !quantity ||
            !movement_type ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "product_id, quantity, movement_type and reason are required"
            });
        }

        // Validate quantity
        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        // Validate movement type
        if (!["IN", "OUT"].includes(movement_type)) {
            return res.status(400).json({
                success: false,
                message: "movement_type must be IN or OUT"
            });
        }

        await client.query("BEGIN");

        // Check product
        const productResult = await client.query(
            `
            SELECT
                id,
                name,
                sku,
                current_stock
            FROM products
            WHERE id = $1
            `,
            [product_id]
        );

        if (productResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = productResult.rows[0];

        const currentStock = Number(product.current_stock);
        const movementQuantity = Number(quantity);

        // Calculate new stock
        let newStock: number;

        if (movement_type === "IN") {
            newStock = currentStock + movementQuantity;
        } else {
            if (currentStock < movementQuantity) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock",
                    current_stock: currentStock,
                    requested_quantity: movementQuantity
                });
            }

            newStock = currentStock - movementQuantity;
        }

        // Update product stock
        const updateResult = await client.query(
            `
            UPDATE products
            SET
                current_stock = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, sku, current_stock
            `,
            [newStock, product_id]
        );

        // Insert stock movement
        const movementResult = await client.query(
            `
            INSERT INTO stock_movements
            (
                product_id,
                quantity,
                movement_type,
                reason,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                product_id,
                movementQuantity,
                movement_type,
                reason,
                created_by || null
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Stock movement created successfully",
            movement: movementResult.rows[0],
            product: updateResult.rows[0]
        });

    } catch (error: any) {

        await client.query("ROLLBACK");

        console.error(
            "Create stock movement error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create stock movement",
            error: error.message
        });

    } finally {
        client.release();
    }
};


// ==========================================
// GET ALL STOCK MOVEMENTS
// ==========================================

export const getStockMovements = async (
    req: Request,
    res: Response
) => {
    try {

        const result = await pool.query(
            `
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
            ORDER BY sm.id DESC
            `
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            movements: result.rows
        });

    } catch (error: any) {

        console.error(
            "Get stock movements error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock movements",
            error: error.message
        });
    }
};


// ==========================================
// GET STOCK MOVEMENT BY ID
// ==========================================

export const getStockMovementById = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `
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
            WHERE sm.id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock movement not found"
            });
        }

        return res.status(200).json({
            success: true,
            movement: result.rows[0]
        });

    } catch (error: any) {

        console.error(
            "Get stock movement error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch stock movement",
            error: error.message
        });
    }
};