const express = require("express");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all user exist
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of user
 *       500:
 *         description: Server error
 */
router.get('/', getAllUsers);

module.exports = router;
