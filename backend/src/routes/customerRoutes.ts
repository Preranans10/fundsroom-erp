import { Router } from "express";

import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from "../controllers/customerController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Create customer
router.post(
    "/",
    authenticate,
    createCustomer
);

// Get all customers
router.get(
    "/",
    authenticate,
    getCustomers
);

// Get customer by ID
router.get(
    "/:id",
    authenticate,
    getCustomerById
);

// Update customer
router.put(
    "/:id",
    authenticate,
    updateCustomer
);

// Delete customer
router.delete(
    "/:id",
    authenticate,
    deleteCustomer
);

export default router;