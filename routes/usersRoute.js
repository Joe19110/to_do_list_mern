import express from 'express';
import { activateEmail, forgotPassword, getAccessToken, getActivationToken, getAllUsersInfor, getUserById, getUserInfor, getUserStaff, logout, resetPassword, selectRole, signIn, signUp, updateUser, updateUserRole, updateUserStatus } from '../controllers/users.js';
import { auth } from '../middleware/auth.js';
import { authAdmin } from '../middleware/authAdmin.js';
import { authAdminOrStaff } from '../middleware/authAdminOrStaff.js';

const router = express.Router()

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User related operations
 */

/**
 * @openapi
 * /user-infor:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user information (need auth)
 *     responses:
 *       '200':
 *         description: User information retrieved
 *       '403':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/user-infor", auth, getUserInfor)

/**
 * @openapi
 * /signup:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personal_id:
 *                 type: string
 *                 example: "BN12363468"
 *               name:
 *                 type: string
 *                 example: "Joelliane"
 *               email:
 *                 type: string
 *                 example: "joelliane@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123"
 *               address:
 *                 type: string
 *                 example: "Medan, Indonesia"
 *               phone_number:
 *                 type: string
 *                 example: "08928638276431"
 *     responses:
 *       '200':
 *         description: New user registration successfully
 *       '403':
 *         description: Requested resource is forbidden
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/signup", signUp)


/**
 * @openapi
 * /activate/{activation_token}:
 *   get:
 *     tags:
 *       - User
 *     summary: Activates user account using a token
 *     description: |
 *       This endpoint is triggered by clicking the activation link sent via email.  
 *       It will **automatically redirect** the user to either a success or failure page, depending on the token validity.
 *     parameters:
 *       - in: path
 *         name: activation_token
 *         required: true
 *         schema:
 *           type: string
 *         description: Activation token from email link
 *     responses:
 *       '302':
 *         description: Redirects to success or failure page.
 *         headers:
 *           Location:
 *             description: URL to which the user is redirected
 *             schema:
 *               type: string
 *             example: /activation-success
 *       '500':
 *         description: Internal server error during activation process
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error while validating activation token"
 */
router.get('/activate/:activation_token', getActivationToken)
  
/**
 * @openapi
 * /activation:
 *   post:
 *     tags:
 *       - User
 *     summary: Activate user email
 *     description: This endpoint activates the user account when they click the email activation link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activation_token:
 *                 type: string
 *                 description: Activation token sent to the user's email.
 *                 example: "your_activation_token"
 *     responses:
 *       '200':
 *         description: Account has been successfully activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account has been activated. Please login now!"
 *       '400':
 *         description: Invalid or expired activation token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This email already exists."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An internal error occurred."
 */
router.post("/activation", activateEmail);

/**
 * @openapi
 * /signin:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juwono@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       '200':
 *         description: Sign in successfully
 *       '403':
 *         description: Requested resource is forbidden
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/signin", signIn)

/**
 * @openapi
 * /select-role:
 *   post:
 *     tags:
 *       - User
 *     summary: Select user role after login (if user has more than 1 roles)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               selectedRole:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Role selected successful
 *       '404':
 *         description: Not Found
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/select-role", selectRole)

/**
 * @openapi
 * /refresh_token:
 *   post:
 *     tags:
 *       - User
 *     summary: Refresh access token
 *     responses:
 *       '200':
 *         description: Token refreshed
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/refresh_token", getAccessToken)

/**
 * @openapi
 * /forgot:
 *   post:
 *     tags:
 *       - User
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *     responses:
 *       '200':
 *         description: Password reset email sent
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/forgot", forgotPassword)

/**
 * @openapi
 * /reset:
 *   post:
 *     tags:
 *       - User
 *     summary: Reset user password (need auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "NewPassword123"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword123"
 *     responses:
 *       '200':
 *         description: Password reset successful
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post("/reset", auth, resetPassword)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user information by user ID (need auth)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User information retrieved By ID
 *       '404':
 *         description: User Not Found
 *       '500':
 *         description: Internal server error
 */
router.get("/users/:id", auth, getUserById)

/**
 * @openapi
 * /get_staffs:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users staff (need auth)
 *     responses:
 *       '200':
 *         description: get all users staff successfully
 *       '404':
 *         description: User Not Found
 *       '500':
 *         description: Internal server error
 */
router.get("/get_staffs", auth, getUserStaff)

/**
 * @openapi
 * /all_infor:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users information (need auth)
 *     responses:
 *       '200':
 *         description: All users information retrieved
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/all_infor", auth, authAdminOrStaff, getAllUsersInfor)

/**
 * @openapi
 * /logout:
 *   get:
 *     tags:
 *       - User
 *     summary: Logout user
 *     responses:
 *       '200':
 *         description: User logged out
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/logout", logout)

/**
 * @openapi
 * /update_user:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user information (need auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personal_id:
 *                 type: string
 *                 example: "BN12363468"
 *               name:
 *                 type: string
 *                 example: "Joelliane"
 *               email:
 *                 type: string
 *                 example: "joelliane@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123"
 *               address:
 *                 type: string
 *                 example: "Medan, Indonesia"
 *               phone_number:
 *                 type: string
 *                 example: "08928638276431"
 *     responses:
 *       '200':
 *         description: User information updated
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.patch("/update_user", auth, updateUser)

/**
 * @openapi
 * /update_role/{id}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user role (need auth)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: array
 *                 items: 
 *                   type: integer
 *     responses:
 *       '200':
 *         description: User role updated
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.patch("/update_role/:id", auth, authAdmin, updateUserRole)

/**
 * @openapi
 * /update_user_status/{id}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Change the status of a user (e.g., active, inactive)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "active or inactive"
 *     responses:
 *       '200':
 *         description: User status updated successfully
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.patch("/update_user_status/:id", auth, authAdmin, updateUserStatus)


export default router