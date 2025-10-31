import axiosInstance from "./axios.js";

// ---------------- Auth Apis ----------------
export const signup = async (formData) => {
  const response = await axiosInstance.post("/auth/signup", formData);
  return response.data;
};

export const login = async (formData) => {
  const response = await axiosInstance.post("/auth/login", formData);
  return response.data;
};

export const completeVerification = async (formData) => {
  const response = await axiosInstance.post("/auth/verify", formData);
  return response.data;
};

export const sendVerification = async (formData) => {
  const response = await axiosInstance.post("/auth/send-verification", formData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

// ---------------- User Apis ----------------
export const getUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/user");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (formData) => {
  const res = await axiosInstance.put("/user/profile", formData);
  return res.data;
};

export const changeUserPassword = async (formData) => {
  const res = await axiosInstance.put("/user/change-password", formData);
  return res.data;
};

export const getUserFriends = async () => {
  const response = await axiosInstance.get("/user/friends");
  return response.data;
};

export const getRecommendedUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};

export const getOutgoingFriendReqs = async () => {
  const response = await axiosInstance.get("/user/outgoing-friend-requests");
  return response.data;
};

export const sendFriendRequest = async (id) => {
  const response = await axiosInstance.post(`/user/friend-request/${id}`);
  return response.data;
};

export const acceptFriendRequest = async (id) => {
  const response = await axiosInstance.put(`/user/friend-request/${id}/accept`);
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await axiosInstance.get("/user/friend-requests");
  return response.data;
};

export const declineFriendRequest = async (id) => {
  const response = await axiosInstance.delete(`/user/friend-request/${id}/decline`);
  return response.data;
};

export const removeFriend = async (id) => {
  const response = await axiosInstance.delete(`/user/friends/${id}`);
  return response.data;
};

// admin apis
export const adminLogin = async (formData) => {
  const response = await axiosInstance.post("/admin/login", formData);
  return response.data;
};

export const adminLogout = async () => {
  const response = await axiosInstance.post("/admin/logout");
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get("/admin/getUsers");
  return response.data;
};

export const getMessages = async () => {
  const response = await axiosInstance.get("/admin/getMessages");
  return response.data;
};

export const getChatList = async () => {
  const response = await axiosInstance.get("/chat/getChatList");
  return response.data;
}