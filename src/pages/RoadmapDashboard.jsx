import React from 'react';
import { MapPin, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoadmapDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">PathFinder AI</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-white">
                  <span className="text-gray-400">Welcome back, </span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-white/20"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Your AI-Powered Learning Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Generate personalized roadmaps tailored to your goals and learning style. 
              Let AI guide your path to mastery.
            </p>
          </div>

          {/* Roadmap Grid - Coming Soon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-gray-400">Coming Soon</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Roadmap Generator {i}
                </h3>
                <p className="text-gray-300 text-sm">
                  Create custom learning paths with AI assistance. Track progress and achieve your goals.
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Your Learning Journey?
              </h3>
              <p className="text-gray-300 mb-6">
                Our AI roadmap generator is coming soon. Get ready to revolutionize how you learn.
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
                Get Early Access
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoadmapDashboard;