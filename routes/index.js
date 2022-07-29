import express from "express";
import { refreshToken } from "../controllers/RefreshToken.js";
import {
  createUser,
  deleteUser,
  getUsers,
  getUsersById,
  Login,
  Logout,
  Register,
  updateUser,
} from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

/* verifyToken ini untuk memverifikasi endpoint('/users) yang tidak 
dapat diakses jika user tidak login */
router.get("/users", verifyToken, getUsers);

router.get("/users", getUsers);
router.get("/users/:id", getUsersById);
router.post("/users", createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post("/users", Register);
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);

export default router;
