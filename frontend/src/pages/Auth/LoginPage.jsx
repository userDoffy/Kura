import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { login } from "../../lib/api.js";
import useForm from "../../hooks/useForm.js";
import { useThemeStore } from "../../store/useThemeStore.js";

const LoginPage = () => {
  const { formData, handleChange, errors } = useForm({
    email: "",
    password: "",
  });
  const { theme } = useThemeStore();

  // Animated rotating text with fade
  const words = ["Welcome", "Back", "Friend"];
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

  const {
    mutate: loginMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errors.email || errors.password) return;
    loginMutation(formData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
      data-theme={theme}
    >
      <div className="w-full max-w-4xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-1">Kura</h1>
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
          <p className="text-base-content/60 text-sm mt-1">
            Connect with friends instantly
          </p>
        </div>

        {/* Main Content Card */}
        <div className="flex bg-base-100 rounded-xl shadow-xl overflow-hidden border border-base-300 max-h-[500px]">
          {/* Left Side - Image & Info */}
          <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-20 h-20 bg-primary rounded-full blur-2xl"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <img
                src="/main-image.png"
                alt="Chat Illustration"
                className="max-w-xs rounded-lg shadow-lg mb-4"
              />
              <h3 className="text-lg font-bold text-primary mb-2">
                Stay Connected
              </h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                Join thousands of users who trust Kura for seamless
                communication.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-3/5 p-6">
            <div className="max-w-sm mx-auto">
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-base-content mb-1">
                  Welcome Back
                </h2>
                <p className="text-base-content/60 text-sm">
                  Sign in to your account
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">
                      Email Address
                    </span>
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

                  {/* Reserve space to prevent flicker */}
                  <div className="min-h-[18px] mt-1">
                    {errors.email && (
                      <p className="text-error text-xs">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">
                      Password
                    </span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input input-bordered input-sm w-full pr-10 focus:input-primary transition-colors duration-200"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 inset-y-0 flex items-center text-base-content/60 hover:text-base-content transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.76 6.76a10.031 10.031 0 00-.908 5.457"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Reserve space to prevent flicker */}
                  <div className="min-h-[18px] mt-1">
                    {errors.password && (
                      <p className="text-error text-xs">Invalid Password</p>
                    )}
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-error py-2 text-sm">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="text-xs">
                      {error.response?.data?.message ||
                        "Login failed. Please try again."}
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary btn-sm w-full font-semibold transition-all duration-200 ${
                    isPending
                      ? "loading"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-base-300">
                <p className="text-base-content/60 text-sm">
                  New to Kura?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:text-primary-focus font-semibold transition-colors duration-200 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Bottom Features */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-primary text-lg mb-1">🔒</div>
            <h4 className="font-semibold text-xs">Secure</h4>
          </div>
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-primary text-lg mb-1">⚡</div>
            <h4 className="font-semibold text-xs">Fast</h4>
          </div>
          <div className="bg-base-100/50 backdrop-blur-sm rounded-lg p-3 border border-base-300/50">
            <div className="text-primary text-lg mb-1">🌍</div>
            <h4 className="font-semibold text-xs">Global</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
