// const express = require("express");
// const router = express.Router();
// const { setBudget, getBudgets } = require("../controllers/budgetController");
// const authMiddleware = require("../middleware/authMiddleware");

// /**
//  * @swagger
//  * tags:
//  *   name: Budget
//  *   description: Manage user budgets
//  */

// /**
//  * @swagger
//  * /api/budgets:
//  *   post:
//  *     summary: Create or update budget for a category
//  *     tags: [Budget]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - category
//  *               - limit
//  *             properties:
//  *               category:
//  *                 type: string
//  *                 example: Food & Drink
//  *               limit:
//  *                 type: number
//  *                 example: 5000000
//  *     responses:
//  *       200:
//  *         description: Budget created or updated successfully
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Unauthorized
//  */
// router.post("/", authMiddleware, setBudget);

// /**
//  * @swagger
//  * /api/budgets:
//  *   get:
//  *     summary: Get all budgets with current spending and progress
//  *     tags: [Budget]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of budgets with spending and progress percentage
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   category:
//  *                     type: string
//  *                   limit:
//  *                     type: number
//  *                   spent:
//  *                     type: number
//  *                   progress:
//  *                     type: number
//  *       401:
//  *         description: Unauthorized
//  */
// router.get("/", authMiddleware, getBudgets);

// module.exports = router;
const express = require("express");
const router = express.Router();
const { 
  setBudget, 
  getBudgets, 
  updateBudget, 
  deleteBudget 
} = require("../controllers/budgetController");
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
 *       201:
 *         description: Budget created successfully
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
 *                   _id:
 *                     type: string
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

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update a budget limit
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *                 example: 7000000
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Budget not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       404:
 *         description: Budget not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;
