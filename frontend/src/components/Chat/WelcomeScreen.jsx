import React from "react";
import { MessageCircle, Users, Zap } from "lucide-react";

const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome to Chat</h3>
          <p className="text-base-content/70 leading-relaxed">
            Select a friend from the sidebar to start messaging and enjoy 
            secure, real-time conversations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-success" />
            </div>
            <span>Real-time messaging</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span>See who's online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;