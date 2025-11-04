import { FiCamera, FiMail, FiUser, FiMapPin, FiGlobe } from "react-icons/fi";
import useAuthUser from "../../hooks/useAuthUser.js";
import useForm from "../../hooks/useForm.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeVerification, sendVerification } from "../../lib/api.js";
import { toast } from "react-hot-toast";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { useThemeStore } from "../../store/useThemeStore.js";
import { logout } from "../../lib/api.js"

const VerificationPage = () => {
  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  // Form State
  const { formData, handleChange, setFormData } = useForm({
    profilepic: authUser?.profilepic || "",
    username: authUser?.username || "",
    bio: authUser?.bio || "",
    language: authUser?.language || "",
    location: authUser?.location || "",
    verificationCode: "",
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out");
      queryClient.setQueryData(["authUser"], null);
    },
  });

  // Send Verification Code
  const { mutate: sendCode, isPending: isSendingCode } = useMutation({
    mutationFn: sendVerification,
    onSuccess: () => {
      toast.success("Verification code sent to your email!");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to send code.");
    },
  });

  // Complete Verification
  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: completeVerification,
    onSuccess: () => {
      toast.success("Verification completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Verification failed.");
    },
  });

  // Handle Profile Pic Upload
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

  // Simulate file input click
  const triggerFileInput = () => {
    document.getElementById("profilePicInput").click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify(formData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
      data-theme={theme}
    >
      <div className="w-full max-w-4xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">
            Complete Your Profile
          </h1>
          <p className="text-base-content/60 text-sm">
            Verify your account and set up your profile
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-base-100 rounded-xl shadow-xl border border-base-300 overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b border-base-300">
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center text-primary">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                  1
                </div>
                <span className="font-medium">Profile Info</span>
              </div>
              <div className="w-8 h-px bg-base-300"></div>
              <div className="flex items-center text-base-content/60">
                <div className="w-6 h-6 bg-base-300 rounded-full flex items-center justify-center text-base-content/60 text-xs font-bold mr-2">
                  2
                </div>
                <span>Verification</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="relative cursor-pointer group rounded-full overflow-hidden w-24 h-24 shadow-lg hover:shadow-xl transition-shadow duration-200 ring-2 ring-primary/20 hover:ring-primary/40"
                  onClick={triggerFileInput}
                >
                  <img
                    src={formData.profilepic || "/default-avatar.png"}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <FiCamera className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-base-content">
                    Profile Photo
                  </p>
                  <p className="text-xs text-base-content/60">
                    Click to upload
                  </p>
                </div>
                <input
                  type="file"
                  id="profilePicInput"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Info */}
              <div className="lg:col-span-2 space-y-4">
                {/* Username */}
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
                    className="input input-bordered input-sm w-full focus:input-primary transition-colors"
                    placeholder="Your unique username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Bio</span>
                  </label>
                  <textarea
                    name="bio"
                    rows="2"
                    className="textarea textarea-bordered textarea-sm w-full resize-none focus:textarea-primary transition-colors"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Language and Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium flex items-center gap-1">
                        <FiGlobe className="w-3 h-3" />
                        Language
                      </span>
                    </label>
                    <input
                      type="text"
                      name="language"
                      className="input input-bordered input-sm w-full focus:input-primary transition-colors"
                      placeholder="e.g., English"
                      value={formData.language}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm font-medium flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        Location
                      </span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="input input-bordered input-sm w-full focus:input-primary transition-colors"
                      placeholder="e.g., Kalimati, Kathmandu"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="bg-base-200/50 rounded-lg p-4 border border-base-300">
              <div className="flex items-center gap-2 mb-3">
                <FiMail className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Email Verification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="label py-1">
                    <span className="label-text text-sm">
                      Verification Code
                    </span>
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    className="input input-bordered input-sm w-full focus:input-primary transition-colors"
                    placeholder="Enter 6-digit code"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="button"
                  className={`btn btn-outline btn-secondary btn-sm ${
                    isSendingCode ? "loading" : ""
                  }`}
                  onClick={() => sendCode()}
                  disabled={isSendingCode || isVerifying}
                >
                  {isSendingCode ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>

              <p className="text-xs text-base-content/60 mt-2">
                We'll send a verification code to{" "}
                <strong>{authUser?.email}</strong>
              </p>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                className={`btn btn-primary btn-wide ${
                  isVerifying ? "loading" : ""
                }`}
                disabled={isVerifying || isSendingCode}
              >
                {isVerifying ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Verifying...
                  </>
                ) : (
                  "Complete Verification"
                )}
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => logoutMutation()}
                className="btn btn-outline btn-error btn-sm"
              >
                Logout
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-base-content/60">
            This helps us verify your identity and personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
