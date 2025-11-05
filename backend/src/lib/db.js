import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}\n`);
  } catch (error) {
    console.log("Error in connecting to MongoDB\n", error);
    process.exit(1); // 1 means failure
  }
};