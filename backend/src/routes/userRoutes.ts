import { Router } from "express";

import {
    getUsers,
    createUser
} from "../controllers/userController";

import {
    authenticate
} from "../middleware/authMiddleware";

import {
    authorizeRoles
} from "../middleware/roleMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    getUsers
);

router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN"),
    createUser
);

export default router;