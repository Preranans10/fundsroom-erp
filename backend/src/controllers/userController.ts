import { Request, Response } from "express";
import pool from "../config/database";
import bcrypt from "bcrypt";

export const getUsers = async (
    _req: Request,
    res: Response
) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY id ASC`
        );

        res.status(200).json({
            success: true,
            users: result.rows
        });
    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

export const createUser = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        const validRoles = [
            "ADMIN",
            "SALES",
            "WAREHOUSE",
            "ACCOUNTS"
        ];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
                (name, email, password, role)
             VALUES
                ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};