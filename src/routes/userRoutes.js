import express from "express";
import {
  login,
  register,
  verifyUser,
  getProfile,
} from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/user/register", register);
router.post("/user/verify", verifyUser);
router.post("/user/login", login);
router.get("/user/profile", isAuth, getProfile);

export default router;
