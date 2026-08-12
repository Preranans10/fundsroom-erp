import pool from "../config/database";
import {
    comparePassword,
    hashPassword,
} from "../utils/password";
import { generateToken } from "../utils/jwt";

export const createUser = async (
    name: string,
    email: string,
    password: string,
    role: string
) => {
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
        `INSERT INTO users
        (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role`,
        [
            name,
            email,
            hashedPassword,
            role,
        ]
    );

    return result.rows[0];
};


export const loginUser = async (
    email: string,
    password: string
) => {
    const result = await pool.query(
        `SELECT id, name, email, password, role
         FROM users
         WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const user = result.rows[0];

    const passwordMatch =
        await comparePassword(
            password,
            user.password
        );

    if (!passwordMatch) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};