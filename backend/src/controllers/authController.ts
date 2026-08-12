import { Request, Response } from "express";
import {
    createUser,
    loginUser,
} from "../services/authService";

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            password,
            role,
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and role are required",
            });
        }

        const validRoles = [
            "ADMIN",
            "SALES",
            "WAREHOUSE",
            "ACCOUNTS",
        ];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        const user = await createUser(
            name,
            email,
            password,
            role
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        const result = await loginUser(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            ...result,
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};