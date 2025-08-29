import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { signup } from "../../lib/api.js";
import useForm from "../../hooks/useForm.js";
import { useThemeStore } from "../../store/useThemeStore.js";

const SignUpPage = () => {
  const { formData, handleChange } = useForm({
    username: "",
    email: "",
    password: "",
  });
  const { theme } = useThemeStore();
  
  // Animated rotating text with fade
  const words = ["Create", "Connect", "Grow"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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

  const queryClient = useQueryClient();

  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation(formData);
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: "Very Weak", color: "text-error" },
      { text: "Weak", color: "text-warning" },
      { text: "Good", color: "text-info" },
      { text: "Strong", color: "text-success" }
    ];

    return { strength, ...levels[Math.min(strength, 3)] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
      data-theme={theme}
    >
      <div className="w-full max-w-5xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-1">
            Kura
          </h1>
          <div className="h-6 flex items-center justify-center">
            <span
              className={`text-lg font-semibold transition-all duration-300 ${
                isVisible 
                  ? "opacity-100 transform translate-y-0" 
                  : "opacity-0 transform -translate-y-2"
              } text-secondary`}
            >
              {words[currentWordIndex]}
            </span>
          </div>
          <p className="text-base-content/60 text-sm mt-1">Join our growing community</p>
        </div>

        {/* Main Content Card */}
        <div className="flex bg-base-100 rounded-xl shadow-xl overflow-hidden border border-base-300 max-h-[600px]">
          
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
              <h3 className="text-lg font-bold text-primary mb-2">
                Join the Community
              </h3>
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
              
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-base-content mb-1">Get Started</h2>
                <p className="text-base-content/60 text-sm">Create your account today</p>
              </div>

              {/* SignUp Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="input input-bordered input-sm w-full focus:input-primary transition-colors duration-200"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {formData.username && (
                    <label className="label py-1">
                      <span className={`label-text-alt text-xs ${formData.username.length >= 3 ? 'text-success' : 'text-warning'}`}>
                        {formData.username.length >= 3 ? "✓ Good username" : "Username too short"}
                      </span>
                    </label>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered input-sm w-full focus:input-primary transition-colors duration-200"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input input-bordered input-sm w-full pr-10 focus:input-primary transition-colors duration-200"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.76 6.76a10.031 10.031 0 00-.908 5.457" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Compact Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-1">
                      <div className="flex space-x-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-full rounded ${
                              i < passwordStrength.strength
                                ? passwordStrength.strength === 1
                                  ? "bg-error"
                                  : passwordStrength.strength === 2
                                  ? "bg-warning"
                                  : passwordStrength.strength === 3
                                  ? "bg-info"
                                  : "bg-success"
                                : "bg-base-300"
                            } transition-colors duration-200`}
                          ></div>
                        ))}
                      </div>
                      <label className="label py-0">
                        <span className={`label-text-alt text-xs ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-error py-2 text-sm">
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-xs">{error.response?.data?.message || "Something went wrong!"}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm w-full font-semibold transition-all duration-200 ${
                    isPending ? "loading" : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-base-300">
                <p className="text-base-content/60 text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary-focus font-semibold transition-colors duration-200 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Compact Bottom Features */}
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