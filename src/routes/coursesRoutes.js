import express from "express";
import {
  checkOut,
  getAllCourses,
  getCourseById,
  getLectureById,
  getLectures,
  getMyCourses,
  paymentVerification,
} from "../controllers/coursesController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.get("/courses/all", getAllCourses);
router.get("/course/:id", getCourseById);
router.get("/lectures/:id", isAuth, getLectures);
router.get("/lecture/:id", isAuth, getLectureById);
router.get("/mycourses", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, checkOut);
router.post("/verification/:id", isAuth, paymentVerification);

export default router;
