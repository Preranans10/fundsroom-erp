import { Router } from "express";
import {
    register,
    login
} from "../controllers/authController";

import {
    authenticate,
    AuthRequest
} from "../middleware/authMiddleware";

import {
    authorizeRoles
} from "../middleware/roleMiddleware";

const router = Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logged-in user
router.get("/me", authenticate, (req: AuthRequest, res) => {
    res.json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
});

// ADMIN ONLY
router.get(
    "/admin-test",
    authenticate,
    authorizeRoles("ADMIN"),
    (req: AuthRequest, res) => {
        res.json({
            success: true,
            message: "Welcome Admin! You have admin access.",
            user: req.user
        });
    }
);

export default router;