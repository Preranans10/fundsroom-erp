import { Router } from "express";

import {
    createStockMovement,
    getStockMovements,
    getStockMovementById
} from "../controllers/stockMovementController";

const router = Router();

router.post("/", createStockMovement);

router.get("/", getStockMovements);

router.get("/:id", getStockMovementById);

export default router;