import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {sendOtpEmail} from "../lib/nodemailer.js";

export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://robohash.org/${idx}.png`;


    const newUser = await User.create({
      email,
      username,
      password,
      profilepic: randomAvatar,
    });

    

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
};

export const sendVerificationCode = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "Already verified" });

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCodeHash = await User.hashVerificationCode(verificationCode);
  user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOtpEmail(user.email, verificationCode);

  res.status(200).json({ message: "Verification code resent" });
};

export async function verify(req, res) {
  try {
    const userId = req.user._id;
    const { username, bio, language, location, verificationCode,profilepic } = req.body;

    if (!username || !bio || !language || !location || !verificationCode) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !username && "username",
          !bio && "bio",
          !language && "language",
          !location && "location",
          !verificationCode && "verificationCode",
          !profilepic && "profilepic",
        ].filter(Boolean),
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCodeValid = await user.verifyCode(verificationCode);
    if (!isCodeValid) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.username = username;
    user.bio = bio;
    user.language = language;
    user.location = location;
    user.profilepic = profilepic || user.profilepic;
    user.isVerified = true;
    user.verificationCodeHash = "";
    user.verificationCodeExpiresAt = null;

    await user.save();  

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
