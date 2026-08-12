import { Request, Response } from "express";
import pool from "../config/database";

// CREATE PRODUCT
export const createProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        } = req.body;

        if (
            !name ||
            !sku ||
            !category ||
            unit_price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, SKU, category and unit price are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO products
            (
                name,
                sku,
                category,
                unit_price,
                current_stock,
                minimum_stock,
                warehouse_location
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                name,
                sku,
                category,
                unit_price,
                current_stock ?? 0,
                minimum_stock ?? 0,
                warehouse_location ?? null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};


// GET ALL PRODUCTS
export const getProducts = async (
    req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(
            `SELECT * FROM products
             ORDER BY id DESC`
        );

        res.status(200).json({
            success: true,
            products: result.rows
        });

    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};


// GET PRODUCT BY ID
export const getProductById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM products
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
};


// UPDATE PRODUCT
export const updateProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET
                name = COALESCE($1, name),
                sku = COALESCE($2, sku),
                category = COALESCE($3, category),
                unit_price = COALESCE($4, unit_price),
                current_stock = COALESCE($5, current_stock),
                minimum_stock = COALESCE($6, minimum_stock),
                warehouse_location = COALESCE($7, warehouse_location),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING *`,
            [
                name,
                sku,
                category,
                unit_price,
                current_stock,
                minimum_stock,
                warehouse_location,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};


// DELETE PRODUCT
export const deleteProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM products
             WHERE id = $1
             RETURNING id, name`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};