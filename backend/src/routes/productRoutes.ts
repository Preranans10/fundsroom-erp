import { Router } from "express";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/productController";

import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Create product
router.post(
    "/",
    authenticate,
    createProduct
);

// Get all products
router.get(
    "/",
    authenticate,
    getProducts
);

// Get product by ID
router.get(
    "/:id",
    authenticate,
    getProductById
);

// Update product
router.put(
    "/:id",
    authenticate,
    updateProduct
);

// Delete product
router.delete(
    "/:id",
    authenticate,
    deleteProduct
);

export default router;