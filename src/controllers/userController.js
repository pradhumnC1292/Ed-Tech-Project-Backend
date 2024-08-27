import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";
import { sendMail } from "../middleware/sendMail.js";

// Register User API
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already registered",
      });
    }

    const salt = 10;
    const hashPassword = await bcrypt.hash(password, salt);

    user = {
      name,
      email,
      password: hashPassword,
    };

    const otp = generateOTP();

    const activationToken = jwt.sign(
      { user, otp },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    const data = {
      name,
      otp,
    };

    await sendMail(
      email,
      "Verification email from Infinity School of Coding",
      data
    );

    return res.status(200).json({
      message: "Verification OTP sent to your mail...",
      activationToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// verifyuser API

export const verifyUser = async (req, res) => {
  try {
    const { otp, activationToken } = req.body;
    const verify = jwt.verify(activationToken, process.env.JWT_SECRET_KEY);

    if (!verify) {
      return res.status(401).json({
        message: "Verification unsuccessful Token Expired...",
      });
    }

    const receivedOtp = String(otp).trim();
    const tokenOtp = String(verify.otp).trim();

    // console.log(`receivedOtp => ${receivedOtp} : tokenOtp => ${tokenOtp}`);

    if (verify.otp !== otp) {
      //   console.log(`verify.otp => ${verify.otp} : otp => ${otp}`);
      return res.status(401).json({
        message: "Verification unsuccessful OTP Expired...",
      });
    }
    await User.create({
      name: verify.user.name,
      email: verify.user.email,
      password: verify.user.password,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login User API

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "flase",
        message: "User not found with this email address",
      });
    }

    const comparePassword = bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        status: "flase",
        message: "Invalid email and password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({
      status: "True",
      message: `Welcome back ${user.name}`,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Fetch Profile API

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // console.log(`User ${user}`);
    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
