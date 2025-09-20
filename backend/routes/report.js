const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { exportPDF, exportExcel, getReportSummary } = require('../controllers/reportController');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Generate and download report files
 */

/**
 * @swagger
 * /api/reports/pdf:
 *   get:
 *     summary: Export transactions report as PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get('/pdf', authMiddleware, exportPDF);

/**
 * @swagger
 * /api/reports/excel:
 *   get:
 *     summary: Export transactions report as Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file generated successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get('/excel', authMiddleware, exportExcel);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get transaction summary (income, expense totals)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 income:
 *                   type: number
 *                   description: Total income
 *                 expense:
 *                   type: number
 *                   description: Total expense
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', authMiddleware, getReportSummary);

module.exports = router;
