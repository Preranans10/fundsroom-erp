import { Router } from "express";

import {
    getStock,
    updateStock
} from "../controllers/inventoryController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    getStock
);

router.put(
    "/:id",
    authenticate,
    updateStock
);

export default router;