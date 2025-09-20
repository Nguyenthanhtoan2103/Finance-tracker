const express = require("express");
const router = express.Router();
const { setBudget, getBudgets } = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Budget
 *   description: Manage user budgets
 */

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create or update budget for a category
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - limit
 *             properties:
 *               category:
 *                 type: string
 *                 example: Food & Drink
 *               limit:
 *                 type: number
 *                 example: 5000000
 *     responses:
 *       200:
 *         description: Budget created or updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, setBudget);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets with current spending and progress
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets with spending and progress percentage
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   limit:
 *                     type: number
 *                   spent:
 *                     type: number
 *                   progress:
 *                     type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getBudgets);

module.exports = router;
