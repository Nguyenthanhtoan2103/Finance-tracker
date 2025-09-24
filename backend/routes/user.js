const express = require("express");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách user trả về
 *       500:
 *         description: Lỗi server
 */
router.get("/", getAllUsers);

module.exports = router;
