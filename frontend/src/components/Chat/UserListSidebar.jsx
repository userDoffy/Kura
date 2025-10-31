import React from "react";
import { Search, Users } from "lucide-react";

const UserListSidebar = ({
  users,
  selectedUser,
  onlineUsers,
  onUserSelect,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredUsers = users.filter((user) =>
    (user.fullName || user.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-base-100 border-r border-base-300 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-2 sm:p-3 border-b border-base-300">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm sm:text-base flex-1">Messages</h2>
          <div className="badge badge-primary badge-xs">{users.length}</div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search..."
            className="input input-xs sm:input-sm w-full pl-7 sm:pl-8 bg-base-200 border-none text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-3">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <p className="text-xs sm:text-sm text-base-content/70">
                Loading conversations...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="p-3 bg-base-200/50 rounded-full w-fit mx-auto">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-base-content/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-base-content/80">
                  {searchTerm ? "No matches found" : "No conversations yet"}
                </p>
                <p className="text-xs text-base-content/60 mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start chatting with your friends"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-1 sm:p-1.5 space-y-0.5 sm:space-y-1">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.has(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  className={`p-2 sm:p-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary text-primary-content shadow"
                      : "bg-base-200/50 hover:bg-base-200 active:scale-[0.98]"
                  }`}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="flex items-center gap-2">
                    {/* Avatar with online status */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.profilepic || "/default-avatar.png"}
                        alt={user.username}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                          isSelected ? "border-primary" : "border-base-100"
                        } ${isOnline ? "bg-success" : "bg-base-content/30"}`}
                      />
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs sm:text-sm">
                        {user.fullName || user.username}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs truncate ${
                          isSelected
                            ? "text-primary-content/80"
                            : "text-base-content/60"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>

                    {/* Chevron indicator on mobile */}
                    <div className={`lg:hidden flex-shrink-0 ${
                      isSelected ? 'text-primary-content/60' : 'text-base-content/40'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
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