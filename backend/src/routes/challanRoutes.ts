import { Router } from "express";

import {
    createChallan,
    getChallans,
    getChallanById
} from "../controllers/challanController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Create challan
router.post(
    "/",
    authenticate,
    createChallan
);

// Get all challans
router.get(
    "/",
    authenticate,
    getChallans
);

// Get challan by ID
router.get(
    "/:id",
    authenticate,
    getChallanById
);

export default router;