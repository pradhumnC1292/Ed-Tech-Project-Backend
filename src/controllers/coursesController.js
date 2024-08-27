import { razorpay } from "../../server.js";
import { Courses } from "../models/coursesModel.js";
import { Lecture } from "../models/lectureModel.js";
import { User } from "../models/userModel.js";
import { Payment } from "../models/paymentModel.js";
import ErrorHandler from "./../middleware/error.js";
import crypto from "crypto";

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Courses.find();

    if (!courses) {
      return next(new ErrorHandler("No Course found !! ", 404));
    }
    res.status(200).json({
      status: "True",
      courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Courses.findById(req.params.id);

    if (!course) {
      return next(new ErrorHandler("No Course found with this Id!! ", 404));
    }

    res.status(200).json({
      status: "True",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const getLectures = async (req, res, next) => {
  try {
    const lectures = await Lecture.find({ course: req.params.id });
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.role === "admin") {
      return res.status(200).json({
        status: "True",
        lectures,
      });
    }

    if (!user.subscription.includes(req.params.id)) {
      return next(new ErrorHandler("You have no subscription", 400));
    }

    return res.status(200).json({
      status: "True",
      lectures,
    });
  } catch (error) {
    next(error);
  }
};

export const getLectureById = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.role === "admin") {
      return res.status(200).json({
        status: "True",
        lecture,
      });
    }

    if (!user.subscription.includes(req.params.id)) {
      return next(new ErrorHandler("You have no subscription", 400));
    }

    return res.status(200).json({
      status: "True",
      lecture,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Courses.findById({ _id: req.params.subscription });

    if (!courses) {
      return next(new ErrorHandler("You have no subscription", 400));
    }

    res.status(200).json({
      status: "True",
      courses,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const course = await Courses.findById(req.params.id);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    if (user.subscription.includes(course._id)) {
      return res.status(200).json({
        status: "True",
        message: "You already have a subscription",
      });
    }

    // Prepare payment order options
    const options = {
      amount: Number(course.price * 100),
      currency: "INR",
    };

    // Create a new order with Razorpay
    const order = await razorpay.orders.create(options);
    if (!order) {
      return next(
        new ErrorHandler("Unable to create order, please try again", 500)
      );
    }

    return res.status(201).json({
      status: "True",
      message: "Order created successfully",
      order,
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentVerification = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new ErrorHandler("Missing required payment details", 400));
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return next(new ErrorHandler("Payment verification failed", 400));
    }

    // Fetch user and course in parallel
    const [user, course] = await Promise.all([
      User.findById(req.user._id),
      Courses.findById(req.params.id),
    ]);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    // Create a new payment record
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Update user's subscription
    user.subscription.push(course._id);
    await user.save();

    return res.status(200).json({
      status: "True",
      message: "Course purchased successfully",
    });
  } catch (error) {
    next(error);
  }
};
