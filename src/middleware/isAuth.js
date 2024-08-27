import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import ErrorHandler from "./error.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    // console.log(`Token : ${token}`);

    if (!token) {
      return next(new ErrorHandler("Please Login", 403));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decodedData._id);

    if (!req.user) {
      return next(new ErrorHandler("User not found. Please login again.", 404));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(
        new ErrorHandler("You are not an Admin. Unauthorised Person...", 403)
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// export const isAuth = async (req, res, next) => {
//   try {
//     const token = req.headers.token;
//     console.log(`Token : ${token}`);

//     if (!token)
//       return res.status(403).json({
//         message: "Please Login",
//       });

//     const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

//     req.user = await User.findById(decodedData._id);

//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: "Login First",
//     });
//   }
// };
