import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../../hooks/useAuthUser";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { updateUserProfile, changeUserPassword } from "../../lib/api";
import { toast } from "react-hot-toast";
import useForm from "../../hooks/useForm.js";
import {
  Camera,
  Edit3,
  Users,
  Lock,
  Save,
  X,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const { formData, handleChange, setFormData } = useForm({
    profilepic: authUser?.profilepic || "",
    username: authUser?.username || "",
    bio: authUser?.bio || "",
  });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Upload profile pic
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading image...");

    try {
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, profilepic: url }));
      toast.dismiss();
      toast.success("Profile picture updated! 📸");
    } catch (err) {
      toast.dismiss();
      toast.error("Upload failed! Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Update profile
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success("Profile updated successfully! ✨");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    },
  });

  // Change password
  const { mutate: changePassword, isPending: isChanging } = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      toast.success("Password changed successfully! 🔐");
      setPasswordModalOpen(false);
      setPasswordData({ oldPassword: "", newPassword: "" });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to change password");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    updateProfile(formData);
  };

  const handlePasswordChange = () => {
    if (!passwordData.oldPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    changePassword(passwordData);
  };

  return (
    <div className="bg-base-100">
      <div className="max-w-3xl p-4 sm:p-6 mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-primary mb-1">Your Profile</h1>
          <p className="text-sm text-base-content/70">
            Manage your account settings
          </p>
        </div>

        <div className="bg-base-100 shadow-xl rounded-xl overflow-hidden">
          {/* Profile Header Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-base-100 shadow-md">
                  {formData.profilepic ? (
                    <img
                      src={formData.profilepic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-base-200 flex items-center justify-center">
                      <Users className="w-8 h-8 text-base-content/40" />
                    </div>
                  )}
                </div>

                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                  {isUploading ? (
                    <div className="loading loading-spinner loading-sm text-white"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* User Stats */}
              <div className="flex items-center gap-4 text-center text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    {authUser?.friends?.length || 0}
                  </span>
                  <span className="text-base-content/60 hidden sm:inline">
                    friends
                  </span>
                </div>
              </div>

              {/* Email Section */}
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3 h-3 text-primary" />
                <span className="text-base-content/80">
                  {authUser?.email || "No email"}
                </span>
                {authUser?.email && (
                  <div className="badge badge-success badge-xs">Verified</div>
                )}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Username */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Username
                  </span>
                </label>
                <input
                  type="text"
                  name="username"
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
             
              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Bio
                  </span>
                </label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered w-full resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell something about yourself..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-1 gap-2 hover:scale-105 transition-transform duration-200"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline gap-2 hover:scale-105 transition-transform duration-200"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-primary/10 p-4 border-b border-base-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </h2>
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={() => setPasswordModalOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-3">
                {/* Old Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Current Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Password must be at least 6 characters
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 pt-0 flex justify-end gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={isChanging}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary gap-2"
                  onClick={handlePasswordChange}
                  disabled={isChanging}
                >
                  {isChanging ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
