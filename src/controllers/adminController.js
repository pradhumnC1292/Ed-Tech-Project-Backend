import { promisify } from "util";
import ErrorHandler from "../middleware/error.js";
import { Courses } from "../models/coursesModel.js";
import { Lecture } from "../models/lectureModel.js";
import { rm } from "fs";
import fs from "fs";
import { User } from "../models/userModel.js";

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy, duration, price } =
      req.body;
    const image = req.file;

    await Courses.create({
      title,
      description,
      category,
      createdBy,
      image: image?.path,
      duration,
      price,
    });
    res.status(201).json({
      status: "True",
      message: "Course Created Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create a new Lecture API

export const addLectures = async (req, res, next) => {
  try {
    const course = await Courses.findById(req.params.id);

    if (!course) {
      return next(new ErrorHandler("No Course found with this ID !! ", 404));
    }
    const { title, description } = req.body;
    const file = req.file; // Video file

    const lecture = await Lecture.create({
      title,
      description,
      video: file?.path,
      course: course._id,
    });

    res.status(200).json({
      status: "True",
      message: "Lecture Created Successfully",
      lecture,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLectures = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    rm(lecture.video, () => {
      console.log("Video deleted successfully");
    });

    await lecture.deleteOne();

    return res.status(204).json({
      status: "True",
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Courses.findById(req.params.id);
    const lectures = await Lecture.find({ course: course._id });

    await Promise.all(
      lectures.map(async (lecture) => {
        await unlinkAsync(lecture.video);
        console.log("Video deleted");
      })
    );
    rm(course.image, () => {
      console.log("Image deleted successfully");
    });

    await Lecture.find({ course: req.params.id }).deleteMany();
    await course.deleteOne();
    await User.updateMany({}, { $pull: { subscription: req.params.id } });

    return res.status(200).json({
      status: "True",
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStats = async (req, res) => {
  try {
    const totalCourses = (await Courses.find()).length;
    const totalLectures = (await Lecture.find()).length;
    const totalUsers = (await User.find()).length;

    const stats = {
      totalCourses,
      totalLectures,
      totalUsers,
    };

    res.status(200).json({
      status: "True",
      stats,
    });
  } catch (error) {
    next(error);
  }
};
