import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {sendOtpEmail} from "../lib/nodemailer.js";

// Step 1: Send verification code (before creating user)
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeHash = await User.hashVerificationCode(verificationCode);

    // Store temporarily in session or return token with hash
    const tempToken = jwt.sign(
      { 
        email,
        verificationCodeHash,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    await sendOtpEmail(email, verificationCode);

    res.status(200).json({ 
      message: "Verification code sent",
      tempToken 
    });
  } catch (error) {
    console.log("Error in sendVerificationCode controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Step 2: Complete signup with verification (creates user)
export const signup = async (req, res) => {
  const { email, password, username, profilepic, verificationCode, tempToken } = req.body;

  try {
    // Validate all fields
    if (!email || !password || !username || !verificationCode || !tempToken) {
      return res.status(400).json({ 
        message: "All fields are required",
        missingFields: [
          !email && "email",
          !password && "password",
          !username && "username",
          !verificationCode && "verificationCode",
          !tempToken && "tempToken"
        ].filter(Boolean)
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify the temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired verification session" });
    }

    if (decoded.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    if (Date.now() > decoded.expiresAt) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    // Verify the code
    const isCodeValid = await User.verifyCodeStatic(verificationCode, decoded.verificationCodeHash);
    if (!isCodeValid) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if user was created in the meantime
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate profile picture if not provided
    const finalProfilePic = profilepic || `https://robohash.org/${Math.floor(Math.random() * 100) + 1}.png`;

    // Create the user (already verified)
    const newUser = await User.create({
      email,
      username,
      password,
      profilepic: finalProfilePic,
      isVerified: true // User is verified from the start
    });

    // Generate auth token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite:isProduction ? "none" : "lax"
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

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite:isProduction ? "none" : "lax"
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  console.log("Logging out");
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ success: true, message: "Logout successful" });
};

