import React from "react";
import { Search, Users } from "lucide-react";

const UserListSidebar = ({
  users,
  selectedUser,
  onlineUsers,
  onUserSelect,
  isLoading,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredUsers = users.filter((user) =>
    (user.fullName || user.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    // In UserListSidebar component, ensure the container height:
    <div className="w-72 bg-base-300/50 backdrop-blur-sm border-r border-base-content/10 flex flex-col h-screen">
      {/* Header */}
      <div className="p-3 border-b border-base-content/10 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-primary/10 rounded-full">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-bold">Messages</h2>
          <div className="ml-auto badge badge-primary badge-xs">
            {users.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="input input-xs w-full pl-8 bg-base-100/50 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <span className="loading loading-spinner loading-sm"></span>
              <p className="text-xs text-base-content/70 mt-1">
                Loading chats...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-base-content/30 mx-auto mb-2" />
              <p className="text-sm text-base-content/70">
                {searchTerm ? "No chats found" : "No friends found"}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-1 space-y-0.5">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.has(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-content shadow-md"
                      : "bg-base-100/70 hover:bg-base-100 hover:shadow-sm"
                  }`}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={user.profilepic || "/default-avatar.png"}
                        alt={user.username}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-base-content/10"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                          isSelected
                            ? "border-primary-content"
                            : "border-base-100"
                        } ${isOnline ? "bg-success" : "bg-base-content/20"}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {user.fullName || user.username}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected
                            ? "text-primary-content/80"
                            : "text-base-content/60"
                        }`}
                      >
                        {isOnline ? "🟢 Online" : "⚪ Offline"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListSidebar;
