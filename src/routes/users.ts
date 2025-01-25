import { Router } from "express";
import { getUserById, getUsers } from "../handlers/users";

const router = Router();

// example the route would be as of right now /api/users
router.get('/', getUsers);

// example the route would be as of right now /api/users/(some user id passed in the response header)
router.get('/:id', getUserById)

export default router;