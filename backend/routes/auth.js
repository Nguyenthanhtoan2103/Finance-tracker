const express = require("express");
const passport = require("passport");
const { register, login, googleCallback } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication APIs (Register, Login, Google OAuth2)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new account with username, email, and password.
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
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user with email and password. Returns JWT token.
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
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Login with Google OAuth2
 *     description: Redirects the user to Google for OAuth2 login.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth2 login screen
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     description: Google redirects here after successful login. Backend will create a JWT token and redirect user to the frontend with that token.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to frontend with JWT token in query string
 *       401:
 *         description: Unauthorized (OAuth2 failed)
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleCallback
);

module.exports = router;
