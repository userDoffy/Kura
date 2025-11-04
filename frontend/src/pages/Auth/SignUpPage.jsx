import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { signup, sendVerificationCode } from "../../lib/api.js";
import useForm from "../../hooks/useForm.js";
import { useThemeStore } from "../../store/useThemeStore.js";
import { FiCamera, FiUser, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [tempToken, setTempToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { formData, handleChange, errors, setFormData } = useForm({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilepic: "",
    verificationCode: "",
  });

  // Animated rotating text
  const words = ["Create", "Connect", "Grow"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Send verification code mutation
  const { mutate: sendCode, isPending: isSendingCode } = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (data) => {
      setTempToken(data.tempToken);
      toast.success("Verification code sent to your email!");
      setCurrentStep(2);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send code");
    },
  });

  // Complete signup mutation
  const { mutate: signupMutation, isPending: isSigningUp, error: signupError } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });

  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading("Uploading image...");
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, profilepic: url }));
      toast.dismiss();
      toast.success("Image uploaded!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.dismiss();
      toast.error(err?.message || "Failed to upload image");
    }
  };

  const triggerFileInput = () => {
    document.getElementById("profilePicInput").click();
  };

  // Step 1: Basic credentials - send code on submit
  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (errors.username || errors.email || errors.password || errors.confirmPassword) {
      toast.error("Please fix the errors before continuing");
      return;
    }
    // Send verification code
    sendCode(formData.email);
  };

  // Step 2: Profile picture & verification - complete signup
  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    signupMutation({
      ...formData,
      tempToken,
    });
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
      data-theme={theme}
    >
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-1">Kura</h1>
          <div className="h-6 flex items-center justify-center">
            <span
              className={`text-lg font-semibold transition-all duration-300 ${
                isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"
              } text-secondary`}
            >
              {words[currentWordIndex]}
            </span>
          </div>
          <p className="text-base-content/60 text-sm mt-1">Join our growing community</p>
        </div>

        {/* Main Card */}
        <div className="flex bg-base-100 rounded-xl shadow-xl overflow-hidden border border-base-300">
          {/* Left Side - Image & Info */}
          <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-secondary/5 to-primary/5 p-8 flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-20 h-20 bg-secondary rounded-full blur-2xl"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 bg-primary rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <img
                src="/main-image.png"
                alt="Join Community"
                className="max-w-xs rounded-lg shadow-lg mb-4"
              />
              <h3 className="text-lg font-bold text-primary mb-2">Join the Community</h3>
              <p className="text-base-content/70 text-sm leading-relaxed mb-4">
                Be part of a growing community of users who value meaningful connections.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="badge badge-primary badge-outline badge-xs">Free Forever</span>
                <span className="badge badge-secondary badge-outline badge-xs">No Ads</span>
                <span className="badge badge-accent badge-outline badge-xs">Privacy First</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-3/5 p-6">
            <div className="max-w-sm mx-auto">
              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center ${currentStep >= 1 ? "text-primary" : "text-base-content/40"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${currentStep >= 1 ? "bg-primary text-white" : "bg-base-300"}`}>
                      1
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">Account</span>
                  </div>
                  <div className="flex-1 h-px bg-base-300 mx-2"></div>
                  <div className={`flex items-center ${currentStep >= 2 ? "text-primary" : "text-base-content/40"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${currentStep >= 2 ? "bg-primary text-white" : "bg-base-300"}`}>
                      2
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">Verify</span>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="btn btn-ghost btn-sm mb-4 gap-1"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {/* Step 1: Basic Credentials */}
              {currentStep === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-base-content mb-1">Create Account</h2>
                    <p className="text-base-content/60 text-sm">Let's get you started</p>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        Username
                      </span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    <div className="h-4">
                      {errors.username && <p className="text-error text-xs mt-0.5">{errors.username}</p>}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium flex items-center gap-1">
                        <FiMail className="w-3 h-3" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="h-4">
                      {errors.email && <p className="text-error text-xs mt-0.5">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium flex items-center gap-1">
                        <FiLock className="w-3 h-3" />
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="input input-bordered input-sm w-full pr-10 focus:input-primary"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <div className="h-4">
                      {errors.password && <p className="text-error text-xs mt-0.5">{errors.password}</p>}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Confirm Password</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="input input-bordered input-sm w-full focus:input-primary"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <div className="h-4">
                      {errors.confirmPassword && <p className="text-error text-xs mt-0.5">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm w-full" disabled={isSendingCode}>
                    {isSendingCode ? "Sending Code..." : "Continue"}
                  </button>
                </form>
              )}

              {/* Step 2: Profile Picture & Verification */}
              {currentStep === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-base-content mb-1">Verify & Setup Profile</h2>
                    <p className="text-base-content/60 text-sm">
                      We sent a code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center space-y-3 mb-4">
                    <div
                      className="relative cursor-pointer group rounded-full overflow-hidden w-20 h-20 shadow-lg hover:shadow-xl transition-shadow ring-2 ring-primary/20 hover:ring-primary/40"
                      onClick={triggerFileInput}
                    >
                      <img
                        src={formData.profilepic || `https://robohash.org/${Math.floor(Math.random() * 100) + 1}.png`}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiCamera className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-xs text-base-content/60">Click to upload photo (optional)</p>
                    <input
                      type="file"
                      id="profilePicInput"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium">Verification Code</span>
                    </label>
                    <input
                      type="text"
                      name="verificationCode"
                      className="input input-bordered input-sm w-full focus:input-primary text-center text-lg tracking-widest"
                      placeholder="000000"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      maxLength="6"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => sendCode(formData.email)}
                    className="btn btn-ghost btn-sm w-full"
                    disabled={isSendingCode}
                  >
                    Resend Code
                  </button>

                  {signupError && (
                    <div className="alert alert-error py-2 text-sm">
                      <span className="text-xs">
                        {signupError.response?.data?.message || "Something went wrong!"}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`btn btn-primary btn-sm w-full ${isSigningUp ? "loading" : ""}`}
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? "Creating Account..." : "Complete Signup"}
                  </button>
                </form>
              )}

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-base-300">
                <p className="text-base-content/60 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary-focus font-semibold hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-secondary text-lg mb-1">🚀</div>
            <h4 className="font-semibold text-xs">Quick Setup</h4>
          </div>
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-secondary text-lg mb-1">👥</div>
            <h4 className="font-semibold text-xs">Find Friends</h4>
          </div>
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-secondary text-lg mb-1">💬</div>
            <h4 className="font-semibold text-xs">Start Chatting</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;