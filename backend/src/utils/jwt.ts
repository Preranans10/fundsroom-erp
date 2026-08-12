import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET =
    process.env.JWT_SECRET || "development_secret";

export interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

export const generateToken = (
    payload: JwtPayload
): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
    });
};

export const verifyToken = (
    token: string
): JwtPayload => {
    return jwt.verify(
        token,
        JWT_SECRET
    ) as JwtPayload;
};