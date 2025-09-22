const express = require("express");
const passport = require("passport");
const { register, login, googleCallback } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string           
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: User logged in successfully (returns JWT token)
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Login with Google OAuth2
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful Google authentication (returns JWT via redirect)
 *       401:
 *         description: Unauthorized
 */
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleCallback);

module.exports = router;
