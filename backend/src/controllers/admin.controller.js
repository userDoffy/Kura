import User from "../models/User.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    if(!user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
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

export const getUsers = async (req, res) => {
    try {
        console.log("Getting users..."); // Debug log
        
        // First, let's check all users to see what we have
        const allUsers = await User.find().select('username email isAdmin');
        console.log("All users in database:", allUsers);
        console.log(`Total users in database: ${allUsers.length}`);
        
        // Check how many are admins vs non-admins
        const adminUsers = allUsers.filter(user => user.isAdmin === true);
        const nonAdminUsers = allUsers.filter(user => user.isAdmin === false);
        const usersWithoutAdminField = allUsers.filter(user => user.isAdmin === undefined || user.isAdmin === null);
        
        console.log(`Admin users: ${adminUsers.length}`);
        console.log(`Non-admin users: ${nonAdminUsers.length}`);
        console.log(`Users without isAdmin field: ${usersWithoutAdminField.length}`);
        
        // Now get the filtered users (excluding admins)
        const users = await User.find({ 
            $or: [
                { isAdmin: false },
                { isAdmin: { $exists: false } }, // Include users where isAdmin field doesn't exist
                { isAdmin: null }
            ]
        }).select('-password -verificationCodeHash -verificationCodeExpiresAt');
        
        console.log(`Found ${users.length} non-admin users`); // Debug log
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log("Error in getUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        console.log("Getting messages..."); // Debug log
        const messages = await Message.find()
            .populate('senderId', 'username email') // Populate sender with username and email
            .populate('receiverId', 'username email') // Populate receiver with username and email
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 messages for performance
        
        console.log(`Found ${messages.length} messages`); // Debug log
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};