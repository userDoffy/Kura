import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import { Search, Users, UserPlus, Send, Clock, Heart } from "lucide-react";
import FriendCard from "../../components/FriendCard";
import {
  getUserFriends,
  getFriendRequests,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../../lib/api";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  // --- Queries ---
  const { data: friends } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });
  const { data: friendRequests } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendRequests });
  const { data: outgoingRequests } = useQuery({ queryKey: ["outgoingRequests"], queryFn: getOutgoingFriendReqs });
  const { data: recommended } = useQuery({ queryKey: ["recommendedUsers"], queryFn: getRecommendedUsers });

  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeIncoming = Array.isArray(friendRequests?.incomingReqs) ? friendRequests.incomingReqs : [];
  const safeOutgoing = Array.isArray(outgoingRequests) ? outgoingRequests : [];
  const safeRecommended = Array.isArray(recommended) ? recommended : [];

  // --- Mutations ---
  const acceptFriendMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (_, reqId) => {
      toast.success("Friend request accepted! 🎉");
      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["friendRequests"]);
      queryClient.invalidateQueries(["recommendedUsers"]);
    },
    onError: () => toast.error("Failed to accept request."),
  });

  const declineFriendMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: (_, reqId) => {
      toast.success("Friend request declined.");
      queryClient.invalidateQueries(["friendRequests"]);
      queryClient.invalidateQueries(["recommendedUsers"]);
    },
    onError: () => toast.error("Failed to decline request."),
  });

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: (_, friendId) => {
      toast.success("Friend removed.");
      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["recommendedUsers"]);
    },
    onError: () => toast.error("Failed to remove friend."),
  });

  const sendFriendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_, userId) => {
      toast.success("Friend request sent! 📤");
      queryClient.invalidateQueries(["outgoingRequests"]);
      queryClient.invalidateQueries(["recommendedUsers"]);
    },
    onError: () => toast.error("Failed to send friend request."),
  });

  // --- Helpers ---
  const outgoingRequestIds = new Set(safeOutgoing.map((r) => r.recipient?._id || r._id));
  const incomingRequestMap = new Map(safeIncoming.map((r) => [r.sender?._id, r._id]));

  const filteredRecommended = safeRecommended.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "friends", label: "Friends", count: safeFriends.length, icon: Users },
    { id: "incoming", label: "Requests", count: safeIncoming.length, icon: Heart },
    { id: "outgoing", label: "Sent", count: safeOutgoing.length, icon: Send },
    { id: "discover", label: "Discover", count: filteredRecommended.length, icon: UserPlus },
  ];

  const renderEmptyState = (title, description, Icon) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
        <icon className="w-10 h-10 text-base-content/40" />
      </div>
      <h3 className="text-lg font-semibold text-base-content mb-2">{title}</h3>
      <p className="text-base-content/60 max-w-sm">{description}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "friends":
        return safeFriends.length === 0 ? (
          renderEmptyState(
            "No friends yet",
            "Start connecting with people by sending friend requests!",
            Users
          )
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
              {safeFriends.map((friend) => (
                <FriendCard
                  key={friend._id}
                  user={friend}
                  onRemove={() => removeFriendMutation.mutate(friend._id)}
                />
              ))}
            </div>
          </div>
        );

      case "incoming":
        return safeIncoming.length === 0 ? (
          renderEmptyState(
            "No friend requests",
            "When someone sends you a friend request, it will appear here.",
            Heart
          )
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
              {safeIncoming.map((req) => (
                <FriendCard
                  key={req._id}
                  user={req.sender}
                  onAccept={() => acceptFriendMutation.mutate(req._id)}
                  onDecline={() => declineFriendMutation.mutate(req._id)}
                />
              ))}
            </div>
          </div>
        );

      case "outgoing":
        return safeOutgoing.length === 0 ? (
          renderEmptyState(
            "No pending requests",
            "Friend requests you've sent will appear here while they're pending.",
            Clock
          )
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
              {safeOutgoing.map((req) => (
                <FriendCard key={req._id} user={req.recipient || req} pending />
              ))}
            </div>
          </div>
        );

      case "discover":
        return (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex justify-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input input-bordered pl-10 w-full focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Results */}
            {filteredRecommended.length === 0 ? (
              renderEmptyState(
                "No users found",
                searchTerm ? "Try adjusting your search term." : "No suggested users available right now.",
                Search
              )
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
                  {filteredRecommended.map((user) => {
                    const incomingReqId = incomingRequestMap.get(user._id);

                    if (incomingReqId) {
                      return (
                        <FriendCard
                          key={incomingReqId}
                          user={user}
                          onAccept={() => acceptFriendMutation.mutate(incomingReqId)}
                          onDecline={() => declineFriendMutation.mutate(incomingReqId)}
                        />
                      );
                    }

                    if (outgoingRequestIds.has(user._id)) {
                      return <FriendCard key={user._id} user={user} pending />;
                    }

                    return (
                      <FriendCard
                        key={user._id}
                        user={user}
                        onAdd={() => sendFriendMutation.mutate(user._id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl p-4 sm:p-6 lg:p-8 bg-base-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Friends</h1>
        <p className="text-base-content/70">Connect with people and build your network</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-primary-content shadow-lg scale-105' 
                  : 'bg-base-200 hover:bg-base-300 text-base-content hover:scale-105'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <div className={`
                  badge badge-sm 
                  ${isActive ? 'badge-primary-content' : 'badge-primary'}
                `}>
                  {tab.count}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default FriendsPage;