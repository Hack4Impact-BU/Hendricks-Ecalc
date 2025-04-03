import { Router } from "express";
import { getUserById, getUsers, send2FACode, check2FACode } from "../handlers/users";

const router = Router();

// example the route would be as of right now /api/users
router.get('/', getUsers);

// example the route would be as of right now /api/users/(some user id passed in the response header)
router.get('/:id', getUserById)

// Send the email code to the corresponding user
router.post('/2FA', send2FACode);
router.post('/verify-2fa', check2FACode);

export default router;