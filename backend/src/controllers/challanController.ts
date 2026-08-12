import { Request, Response } from "express";
import pool from "../config/database";

/* =========================================================
   CREATE CHALLAN
   Creates challan as Draft
========================================================= */

export const createChallan = async (
    req: Request,
    res: Response
) => {
    const client = await pool.connect();

    try {
        const {
            customer_id,
            created_by,
            items
        } = req.body;

        if (
            !customer_id ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "customer_id and at least one item are required"
            });
        }

        await client.query("BEGIN");

        /* Check customer */

        const customerResult = await client.query(
            `SELECT id, name
             FROM customers
             WHERE id = $1`,
            [customer_id]
        );

        if (customerResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        /* Generate challan number automatically */

        const numberResult = await client.query(
            `SELECT challan_number
             FROM challans
             ORDER BY id DESC
             LIMIT 1`
        );

        let nextNumber = 1;

        if (numberResult.rows.length > 0) {
            const lastNumber =
                numberResult.rows[0].challan_number;

            const match =
                String(lastNumber).match(/(\d+)$/);

            if (match) {
                nextNumber =
                    Number(match[1]) + 1;
            }
        }

        const challanNumber =
            `CH-${String(nextNumber).padStart(4, "0")}`;

        /* Validate items */

        let totalQuantity = 0;

        const validatedItems: any[] = [];

        for (const item of items) {
            const productId = Number(item.product_id);
            const quantity = Number(item.quantity);

            if (
                !productId ||
                !quantity ||
                quantity <= 0
            ) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message:
                        "Each item must contain a valid product_id and quantity"
                });
            }

            const productResult = await client.query(
                `SELECT
                    id,
                    name,
                    sku,
                    unit_price,
                    current_stock
                 FROM products
                 WHERE id = $1
                 FOR UPDATE`,
                [productId]
            );

            if (productResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    success: false,
                    message:
                        `Product ${productId} not found`
                });
            }

            const product =
                productResult.rows[0];

            totalQuantity += quantity;

            validatedItems.push({
                product_id: product.id,
                product_name: product.name,
                sku: product.sku,
                unit_price: product.unit_price,
                quantity
            });
        }

        /* Create Draft challan */

        const challanResult = await client.query(
            `INSERT INTO challans
                (
                    challan_number,
                    customer_id,
                    total_quantity,
                    status,
                    created_by
                )
             VALUES
                ($1, $2, $3, 'Draft', $4)
             RETURNING *`,
            [
                challanNumber,
                customer_id,
                totalQuantity,
                created_by || null
            ]
        );

        const challan =
            challanResult.rows[0];

        /* Save product snapshot */

        for (const item of validatedItems) {
            await client.query(
                `INSERT INTO challan_items
                    (
                        challan_id,
                        product_id,
                        product_name,
                        sku,
                        unit_price,
                        quantity
                    )
                 VALUES
                    ($1, $2, $3, $4, $5, $6)`,
                [
                    challan.id,
                    item.product_id,
                    item.product_name,
                    item.sku,
                    item.unit_price,
                    item.quantity
                ]
            );
        }

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Draft challan created successfully",
            challan
        });

    } catch (error: any) {

        await client.query("ROLLBACK");

        console.error(
            "Create challan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create challan",
            error: error.message
        });

    } finally {
        client.release();
    }
};


/* =========================================================
   GET ALL CHALLANS
========================================================= */

export const getChallans = async (
    _req: Request,
    res: Response
) => {
    try {

        const result = await pool.query(
            `SELECT
                ch.*,
                c.name AS customer_name
             FROM challans ch
             LEFT JOIN customers c
                ON ch.customer_id = c.id
             ORDER BY ch.id DESC`
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            challans: result.rows
        });

    } catch (error: any) {

        console.error(
            "Get challans error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challans",
            error: error.message
        });
    }
};


/* =========================================================
   GET CHALLAN BY ID
========================================================= */

export const getChallanById = async (
    req: Request,
    res: Response
) => {
    try {

        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const challanResult = await pool.query(
            `SELECT
                ch.*,
                c.name AS customer_name,
                c.mobile AS customer_mobile
             FROM challans ch
             LEFT JOIN customers c
                ON ch.customer_id = c.id
             WHERE ch.id = $1`,
            [id]
        );

        if (challanResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        const itemsResult = await pool.query(
            `SELECT
                id,
                challan_id,
                product_id,
                product_name,
                sku,
                unit_price,
                quantity
             FROM challan_items
             WHERE challan_id = $1
             ORDER BY id`,
            [id]
        );

        return res.status(200).json({
            success: true,
            challan: challanResult.rows[0],
            items: itemsResult.rows
        });

    } catch (error: any) {

        console.error(
            "Get challan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challan",
            error: error.message
        });
    }
};


/* =========================================================
   CONFIRM CHALLAN
   - Check stock
   - Prevent negative stock
   - Reduce inventory
   - Create stock movement
   - Change status to Confirmed
========================================================= */

export const confirmChallan = async (
    req: Request,
    res: Response
) => {
    const client = await pool.connect();

    try {

        const challanId =
            Number(req.params.id);

        const createdBy =
            req.body?.created_by || null;

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        await client.query("BEGIN");

        /* Lock challan */

        const challanResult =
            await client.query(
                `SELECT *
                 FROM challans
                 WHERE id = $1
                 FOR UPDATE`,
                [challanId]
            );

        if (challanResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Challan not found"
            });
        }

        const challan =
            challanResult.rows[0];

        if (challan.status === "Confirmed") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Challan is already confirmed"
            });
        }

        if (challan.status === "Cancelled") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    "Cancelled challan cannot be confirmed"
            });
        }

        /* Get items */

        const itemsResult =
            await client.query(
                `SELECT
                    id,
                    product_id,
                    product_name,
                    sku,
                    quantity
                 FROM challan_items
                 WHERE challan_id = $1
                 ORDER BY id`,
                [challanId]
            );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    "Cannot confirm challan without items"
            });
        }

        /* Validate stock first */

        for (const item of itemsResult.rows) {

            const productResult =
                await client.query(
                    `SELECT
                        id,
                        name,
                        current_stock
                     FROM products
                     WHERE id = $1
                     FOR UPDATE`,
                    [item.product_id]
                );

            if (productResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    success: false,
                    message:
                        `Product ${item.product_id} not found`
                });
            }

            const product =
                productResult.rows[0];

            const currentStock =
                Number(product.current_stock);

            const requestedQuantity =
                Number(item.quantity);

            if (
                currentStock <
                requestedQuantity
            ) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message:
                        `Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${requestedQuantity}`
                });
            }
        }

        /* Reduce stock */

        for (const item of itemsResult.rows) {

            const quantity =
                Number(item.quantity);

            await client.query(
                `UPDATE products
                 SET current_stock =
                     current_stock - $1
                 WHERE id = $2`,
                [
                    quantity,
                    item.product_id
                ]
            );

            /* Stock movement */

            await client.query(
                `INSERT INTO stock_movements
                    (
                        product_id,
                        quantity,
                        movement_type,
                        reason,
                        created_by
                    )
                 VALUES
                    ($1, $2, 'OUT', $3, $4)`,
                [
                    item.product_id,
                    quantity,
                    `Sales Challan ${challan.challan_number}`,
                    createdBy || challan.created_by || null
                ]
            );
        }

        /* Confirm challan */

        const updatedResult =
            await client.query(
                `UPDATE challans
                 SET status = 'Confirmed'
                 WHERE id = $1
                 RETURNING *`,
                [challanId]
            );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message:
                "Challan confirmed and stock updated successfully",
            challan: updatedResult.rows[0]
        });

    } catch (error: any) {

        await client.query("ROLLBACK");

        console.error(
            "Confirm challan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to confirm challan",
            error: error.message
        });

    } finally {
        client.release();
    }
};


/* =========================================================
   CANCEL CHALLAN
========================================================= */

export const cancelChallan = async (
    req: Request,
    res: Response
) => {
    try {

        const challanId =
            Number(req.params.id);

        if (!challanId) {
            return res.status(400).json({
                success: false,
                message: "Invalid challan ID"
            });
        }

        const result = await pool.query(
            `UPDATE challans
             SET status = 'Cancelled'
             WHERE id = $1
               AND status = 'Draft'
             RETURNING *`,
            [challanId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Only Draft challans can be cancelled"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Challan cancelled successfully",
            challan: result.rows[0]
        });

    } catch (error: any) {

        console.error(
            "Cancel challan error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel challan",
            error: error.message
        });
    }
};