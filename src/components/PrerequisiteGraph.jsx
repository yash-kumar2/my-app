import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Network, Eye, List, X, Maximize2 } from 'lucide-react';

const PrerequisiteGraph = ({ roadmapId, token }) => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [viewMode, setViewMode] = useState('visual');
  const [showModal, setShowModal] = useState(false);
  const svgRef = useRef(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://genai-i13e.onrender.com/roadmaps/${roadmapId}/prerequisite-graph`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
        setShowGraph(true);
      } else {
        console.error('Failed to fetch prerequisite graph');
      }
    } catch (error) {
      console.error('Error fetching prerequisite graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeGraph = () => {
    setShowGraph(false);
    setGraphData(null);
    setViewMode('visual');
    setShowModal(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColorHex = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const calculateNodePositions = (nodes, edges) => {
    const positions = {};
    const levels = {};
    
    // Simple topological sort to determine levels
    const inDegree = {};
    nodes.forEach(node => {
      inDegree[node.id] = 0;
    });
    
    edges.forEach(edge => {
      inDegree[edge.to]++;
    });
    
    const queue = [];
    nodes.forEach(node => {
      if (inDegree[node.id] === 0) {
        queue.push(node.id);
        levels[node.id] = 0;
      }
    });
    
    while (queue.length > 0) {
      const current = queue.shift();
      edges.forEach(edge => {
        if (edge.from === current) {
          inDegree[edge.to]--;
          levels[edge.to] = Math.max(levels[edge.to] || 0, levels[current] + 1);
          if (inDegree[edge.to] === 0) {
            queue.push(edge.to);
          }
        }
      });
    }
    
    // Group nodes by level
    const levelGroups = {};
    nodes.forEach(node => {
      const level = levels[node.id] || 0;
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(node);
    });
    
    // Calculate positions
    const svgWidth = 800;
    const svgHeight = 500;
    const levelHeight = svgHeight / (Object.keys(levelGroups).length + 1);
    
    Object.keys(levelGroups).forEach(level => {
      const nodesInLevel = levelGroups[level];
      const levelWidth = svgWidth / (nodesInLevel.length + 1);
      
      nodesInLevel.forEach((node, index) => {
        positions[node.id] = {
          x: (index + 1) * levelWidth,
          y: (parseInt(level) + 1) * levelHeight
        };
      });
    });
    
    return positions;
  };

  const renderVisualGraph = (isModal = false) => {
    if (!graphData || !graphData.nodes || !graphData.edges) return null;
    
    const positions = calculateNodePositions(graphData.nodes, graphData.edges);
    const svgWidth = isModal ? 1400 : 800;
    const svgHeight = isModal ? 900 : 500;
    
    return (
      <div className={`bg-gray-900 rounded-lg p-4 ${isModal ? 'h-full w-full' : 'w-full'} overflow-auto`}>
        <svg ref={svgRef} width={svgWidth} height={svgHeight} className={isModal ? 'w-full h-full' : 'w-full h-auto'} viewBox={isModal ? `0 0 ${svgWidth} ${svgHeight}` : undefined}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
          
          {/* Render edges */}
          {graphData.edges.map((edge, index) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;
            
            return (
              <line
                key={index}
                x1={fromPos.x * (isModal ? 1.5 : 1)}
                y1={fromPos.y * (isModal ? 1.4 : 1)}
                x2={toPos.x * (isModal ? 1.5 : 1)}
                y2={toPos.y * (isModal ? 1.4 : 1)}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Render nodes */}
          {graphData.nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            
            const nodeX = pos.x * (isModal ? 1.5 : 1);
            const nodeY = pos.y * (isModal ? 1.4 : 1);
            const nodeRadius = isModal ? 40 : 30;
            
            return (
              <g key={node.id} className="cursor-pointer">
                <circle
                  cx={nodeX}
                  cy={nodeY}
                  r={nodeRadius}
                  fill={getDifficultyColorHex(node.difficulty)}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={nodeX}
                  y={nodeY - (isModal ? 50 : 40)}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isModal ? "14" : "12"}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {isModal ? node.title : (node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title)}
                </text>
                <text
                  x={nodeX}
                  y={nodeY + (isModal ? 60 : 50)}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize={isModal ? "12" : "10"}
                  className="pointer-events-none"
                >
                  {node.estimatedHours}h
                </text>
                {isModal && (
                  <text
                    x={nodeX}
                    y={nodeY + 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {node.difficulty}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderListView = () => {
    if (!graphData || !graphData.nodes || !graphData.edges) return null;
    
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {graphData.nodes.map((node) => {
            const prerequisites = graphData.edges
              .filter(edge => edge.to === node.id)
              .map(edge => graphData.nodes.find(n => n.id === edge.from))
              .filter(Boolean); // Remove any undefined values
                         
            return (
              <div key={node.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getDifficultyColor(node.difficulty)}`}></div>
                    <h5 className="font-medium text-white">{node.title}</h5>
                  </div>
                  <span className="text-xs text-gray-400">{node.estimatedHours}h</span>
                </div>
                                 
                <p className="text-sm text-gray-300 mb-2">{node.description}</p>
                                 
                {prerequisites.length > 0 && (
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">Prerequisites:</span> {prerequisites.map(p => p.title).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white/10 rounded-lg border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          <h4 className="font-medium text-white">Prerequisite Graph</h4>
        </div>
        <div className="flex items-center gap-2">
          {!showGraph && (
            <button
              onClick={fetchGraph}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              <Network className="w-4 h-4" />
              {loading ? 'Loading...' : 'View Graph'}
            </button>
          )}
          
          {showGraph && graphData && (
            <>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    viewMode === 'visual' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Visual
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-3 h-3" />
                  List
                </button>
              </div>
              
              <button
                onClick={closeGraph}
                className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-lg transition-colors text-sm"
                title="Close graph"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {showGraph && graphData && (
        <div className="mt-4">
          <div className="text-sm text-gray-300 mb-4">
            Learning path with {graphData.nodes.length} topics
          </div>
          
          {viewMode === 'visual' ? (
            <div className="relative">
              {renderVisualGraph()}
              <button
                onClick={() => setShowModal(true)}
                className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                title="View in full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            renderListView()
          )}
        </div>
      )}

      {/* Fixed Modal for full-screen visual graph using Portal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 rounded-lg w-[98vw] h-[98vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-xl font-bold text-white">Prerequisite Graph - Full View</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {renderVisualGraph(true)}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PrerequisiteGraph;