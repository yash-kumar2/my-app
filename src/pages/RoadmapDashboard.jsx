import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Circle, AlertTriangle, Clock, Target, BookOpen, X, Sparkles, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoadmapDashboard = () => {
  const { token, user, logout } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFailedScreen, setShowFailedScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState(new Set());
  const [formData, setFormData] = useState({
    goal: '',
    level: 'beginner',
    totalDays: 30,
    completedTopics: ''
  });

  // Load roadmaps on component mount
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmaps(true);
      const response = await fetch('https://genai-i13e.onrender.com/roadmaps', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmaps(data);
      } else {
        console.error('Failed to fetch roadmaps');
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setLoadingRoadmaps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        goal: formData.goal,
        level: formData.level,
        totalDays: parseInt(formData.totalDays),
        completedTopics: formData.completedTopics ? formData.completedTopics.split(',').map(topic => topic.trim()) : []
      };

      const response = await fetch('https://genai-i13e.onrender.com/roadmaps/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newRoadmap = await response.json();
        setRoadmaps(prev => [newRoadmap, ...prev]);
        setShowModal(false);
        setFormData({ goal: '', level: 'beginner', totalDays: 30, completedTopics: '' });
      } else {
        setShowFailedScreen(true);
      }
    } catch (error) {
      console.error('Error creating roadmap:', error);
      setShowFailedScreen(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (roadmapId, taskIndex, currentStatus) => {
    try {
      const response = await fetch(`https://genai-i13e.onrender.com/roadmaps/${roadmapId}/tasks/${taskIndex}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setRoadmaps(prev => prev.map(roadmap => {
          if (roadmap._id === roadmapId) {
            const updatedTasks = [...roadmap.tasks];
            updatedTasks[taskIndex] = updatedTask;
            return { ...roadmap, tasks: updatedTasks };
          }
          return roadmap;
        }));
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleRoadmapExpansion = (roadmapId) => {
    setExpandedRoadmaps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roadmapId)) {
        newSet.delete(roadmapId);
      } else {
        newSet.add(roadmapId);
      }
      return newSet;
    });
  };

  const isTaskOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTaskStatusIcon = (task) => {
    if (task.completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (isTaskOverdue(task.dueDate)) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskStatusColor = (task) => {
    if (task.completed) {
      return 'border-green-500 bg-green-50';
    } else if (isTaskOverdue(task.dueDate)) {
      return 'border-red-500 bg-red-50';
    } else {
      return 'border-gray-300 bg-white';
    }
  };

  const getRoadmapProgress = (tasks) => {
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if logout API fails
      window.location.href = '/login';
    }
  };

  if (loadingRoadmaps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading roadmaps...</div>
      </div>
    );
  }

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
                  <span className="font-medium">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
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
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Your Learning Roadmaps
              </h2>
              <p className="text-xl text-gray-300">
                AI-powered learning paths tailored to your goals
              </p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create New Roadmap
            </button>
          </div>

          {/* Roadmaps Grid */}
          {roadmaps.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No roadmaps yet</h3>
                <p className="text-gray-300 mb-6">Create your first AI-powered learning roadmap to get started!</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Create Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {roadmaps.map((roadmap) => {
                const isExpanded = expandedRoadmaps.has(roadmap._id);
                return (
                  <div key={roadmap._id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    {/* Roadmap Header - Clickable */}
                    <div 
                      className="flex items-start justify-between mb-6 cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors"
                      onClick={() => toggleRoadmapExpansion(roadmap._id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-white">{roadmap.goal}</h3>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                          <span className="capitalize">{roadmap.level}</span>
                          <span>{roadmap.totalDays} days</span>
                          <span>{getRoadmapProgress(roadmap.tasks)}% complete</span>
                        </div>
                      </div>
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getRoadmapProgress(roadmap.tasks)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tasks - Expandable */}
                    {isExpanded && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {roadmap.tasks.map((task, index) => (
                          <div
                            key={task._id}
                            className={`p-3 rounded-lg border transition-all duration-200 ${getTaskStatusColor(task)}`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskCompletion(roadmap._id, index, task.completed);
                                }}
                                className="mt-1 hover:scale-110 transition-transform"
                              >
                                {getTaskStatusIcon(task)}
                              </button>
                              
                              <div className="flex-1">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {task.description}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className={`text-sm ${
                                    task.completed ? 'text-gray-400' : 
                                    isTaskOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'
                                  }`}>
                                    Due: {formatDate(task.dueDate)}
                                    {isTaskOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Task Count for Collapsed State */}
                    {!isExpanded && (
                      <div className="text-center text-gray-300 text-sm">
                        Click to view {roadmap.tasks.length} tasks
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create Roadmap Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Roadmap</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goal
                </label>
                <input
                  type="text"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  placeholder="e.g., Learn DSA for coding interviews"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Days
                </label>
                <input
                  type="number"
                  value={formData.totalDays}
                  onChange={(e) => setFormData({...formData, totalDays: e.target.value})}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed Topics (Optional)
                </label>
                <input
                  type="text"
                  value={formData.completedTopics}
                  onChange={(e) => setFormData({...formData, completedTopics: e.target.value})}
                  placeholder="e.g., arrays, recursion (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Roadmap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Screen Modal */}
      {showFailedScreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Create Roadmap
            </h3>
            <p className="text-gray-600 mb-6">
              Something went wrong while generating your roadmap. Please try again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFailedScreen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFailedScreen(false);
                  setShowModal(true);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapDashboard;