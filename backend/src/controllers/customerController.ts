import { Request, Response } from "express";
import pool from "../config/database";

// ==========================================
// CREATE CUSTOMER
// POST /api/customers
// ==========================================

export const createCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
            phone,
            city,
            state,
            country
        } = req.body;

        // Required fields
        if (!name || !mobile || !customer_type) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, mobile and customer_type are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO customers (
                name,
                mobile,
                email,
                business_name,
                gst_number,
                customer_type,
                address,
                status,
                follow_up_date,
                notes,
                phone,
                city,
                state,
                country
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, $12, $13, $14
            )
            RETURNING *`,
            [
                name,
                mobile,
                email || null,
                business_name || null,
                gst_number || null,
                customer_type,
                address || null,
                status || "Lead",
                follow_up_date || null,
                notes || null,
                phone || null,
                city || null,
                state || null,
                country || "India"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer: result.rows[0]
        });

    } catch (error: any) {
        console.error(
            "CREATE CUSTOMER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
            code: error.code
        });
    }
};


// ==========================================
// GET ALL CUSTOMERS
// GET /api/customers
// ==========================================

export const getCustomers = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM customers
             ORDER BY id DESC`
        );

        return res.status(200).json({
            success: true,
            customers: result.rows
        });

    } catch (error: any) {
        console.error(
            "GET CUSTOMERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};


// ==========================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// ==========================================

export const getCustomerById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM customers
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            customer: result.rows[0]
        });

    } catch (error: any) {
        console.error(
            "GET CUSTOMER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};


// ==========================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// ==========================================

export const updateCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const {
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
            phone,
            city,
            state,
            country
        } = req.body;

        // Required fields
        if (!name || !mobile || !customer_type) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, mobile and customer_type are required"
            });
        }

        const result = await pool.query(
            `UPDATE customers
             SET
                name = $1,
                mobile = $2,
                email = $3,
                business_name = $4,
                gst_number = $5,
                customer_type = $6,
                address = $7,
                status = $8,
                follow_up_date = $9,
                notes = $10,
                phone = $11,
                city = $12,
                state = $13,
                country = $14,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $15
             RETURNING *`,
            [
                name,
                mobile,
                email || null,
                business_name || null,
                gst_number || null,
                customer_type,
                address || null,
                status || "Lead",
                follow_up_date || null,
                notes || null,
                phone || null,
                city || null,
                state || null,
                country || "India",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            customer: result.rows[0]
        });

    } catch (error: any) {
        console.error(
            "UPDATE CUSTOMER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
            code: error.code
        });
    }
};


// ==========================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// ==========================================

export const deleteCustomer = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM customers
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            customer: result.rows[0]
        });

    } catch (error: any) {
        console.error(
            "DELETE CUSTOMER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete customer"
        });
    }
};