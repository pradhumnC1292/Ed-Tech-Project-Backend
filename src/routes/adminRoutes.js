import express from "express";
import { isAdmin, isAuth } from "../middleware/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLectures,
  getAllStats,
} from "../controllers/adminController.js";
import { uploadFiles } from "../middleware/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/course/edit/:id", isAuth, isAdmin, uploadFiles, addLectures);
router.delete("/course/delete/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLectures);
router.get("/stats", isAuth, isAdmin, getAllStats);

export default router;
