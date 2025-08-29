import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
    },
    profilepic: {
      type: String,
      default: "https://robohash.org/1.png",
    },
    onlineStatus: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    language: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCodeHash: {
      type: String,
      default: "",
    },
    verificationCodeExpiresAt: {
      type: Date,
      default: null,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(
    enteredPassword,
    this.password
  );
  return isPasswordCorrect;
};

userSchema.statics.hashVerificationCode = async function (verificationCode) {
  const salt = await bcrypt.genSalt(10);
  const hashedCode = await bcrypt.hash(verificationCode, salt);
  return hashedCode;
};

userSchema.methods.verifyCode = async function (verificationCode) {
  const isCodeValid =
    (await bcrypt.compare(verificationCode, this.verificationCodeHash)) &&
    this.verificationCodeExpiresAt > new Date();
  return isCodeValid;
};

const User = mongoose.model("User", userSchema);

export default User;
