const express = require("express");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: get all user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: list of user
 *       500:
 *         description: server error
 */
router.get('/', getAllUsers);

module.exports = router;
