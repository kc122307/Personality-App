import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertCircle, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import api from "../api/api";
import html2canvas from "html2canvas"; // You'll need to install this: npm install html2canvas

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];

const History = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const selectedTestRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/results");
        
        // Process and validate dates
        const processedResults = response.data.data.map(result => {
          // Make sure date is properly formatted - provide fallback if invalid
          const dateObj = new Date(result.date);
          const isValidDate = !isNaN(dateObj.getTime());
          
          return {
            ...result,
            // Use ISO string format for consistency
            date: isValidDate ? dateObj.toISOString() : new Date().toISOString(),
            // Ensure scores exist
            scores: result.scores || {
              E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
            }
          };
        });
        
        const sortedResults = processedResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTestResults(sortedResults);
        
        if (sortedResults.length > 0) {
          setSelectedTestId(sortedResults[0].id);
        }
      } catch (err) {
        console.error("Error fetching test history:", err);
        setError("Unable to fetch test results from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Unknown Date";
    }
  };

  const toggleExpand = (id) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  const selectedTest = testResults.find(test => test.id === selectedTestId);

  const captureScreenshot = async (testId) => {
    if (isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // First make sure the selected test is the one we want to capture
      if (testId !== selectedTestId) {
        setSelectedTestId(testId);
        // We need to wait for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (selectedTestRef.current) {
        const canvas = await html2canvas(selectedTestRef.current, {
          backgroundColor: "#f0fdf4", // Light green background
          scale: 2, // Higher quality
          logging: false,
          useCORS: true
        });
        
        const url = canvas.toDataURL("image/png");
        setScreenshotUrl(url);
        setShareModalOpen(true);
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const shareOnSocialMedia = (platform) => {
    const test = testResults.find(t => t.id === selectedTestId);
    if (!test) return;
    
    const shareText = `I'm a ${test.personalityType} personality type! ${test.description || "Check out my personality test results!"} Take the test yourself!`;
    const shareUrl = window.location.href;
    
    let shareLink = '';
    
    switch(platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`My ${test.personalityType} Personality Test Results`)}`;
        break;
      default:
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    
    closeShareModal();
  };

  const downloadScreenshot = () => {
    if (!screenshotUrl) return;
    
    const test = testResults.find(t => t.id === selectedTestId);
    if (!test) return;
    
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = `${test.personalityType}-personality-test-${formatDate(test.date).replace(/\s/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setScreenshotUrl(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500 bg-red-100 text-red-800 rounded-lg p-4 max-w-md mx-auto mt-10">
        <div className="flex items-center">
          <AlertCircle className="mr-2 text-red-500" />
          {error}
        </div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 text-gray-800">
        <div className="text-center p-8 bg-white shadow-lg rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold text-green-800 mb-4">No Test History Found</h2>
          <p className="text-gray-600 mb-6">Take the personality test to track your personal growth over time.</p>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition" onClick={() => window.location.href = "/"}>Take Personality Test</button>
        </div>
      </div>
    );
  }

  const generateChartData = (test) => {
    if (!test || !test.scores) return [];
    return Object.keys(test.scores).map((trait) => ({
      trait,
      score: test.scores[trait] || 0 // Provide fallback value
    }));
  };

  const chartData = generateChartData(selectedTest);

  return (
    <div className="bg-green-50 min-h-screen text-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center border border-green-100">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Personality Test History</h2>
          <p className="text-gray-600 mb-4">View your past test results and track your personal growth</p>
        </div>

        {/* Test History List */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-green-100">
          <h3 className="text-xl font-bold text-green-700 mb-4">Your Test History</h3>
          <div className="space-y-3">
            {testResults.map((test) => (
              <div 
                key={test.id} 
                className={`border ${selectedTestId === test.id ? 'border-green-500' : 'border-green-100'} rounded-lg overflow-hidden`}
              >
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${selectedTestId === test.id ? 'bg-green-100' : 'bg-white'} hover:bg-green-50`} 
                  onClick={() => toggleExpand(test.id)}
                >
                  <div>
                    <div className="font-medium">{formatDate(test.date)}</div>
                    <div className="text-sm text-gray-600">Type: {test.personalityType}</div>
                  </div>
                  <div className="flex items-center">
                    <button 
                      className={`mr-2 py-1 px-3 rounded ${selectedTestId === test.id ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTestId(test.id);
                      }}
                    >
                      {selectedTestId === test.id ? 'Selected' : 'View'}
                    </button>
                    <button 
                      className="mr-2 py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        captureScreenshot(test.id);
                      }}
                      disabled={isCapturing}
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </button>
                    {expandedTestId === test.id ? <ChevronUp className="text-green-700" /> : <ChevronDown className="text-green-700" />}
                  </div>
                </div>
                
                {expandedTestId === test.id && (
                  <div className="p-4 bg-green-50 border-t border-green-100">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(test.scores || {}).map(([trait, score]) => (
                        <div key={trait} className="flex justify-between">
                          <span className="text-gray-600">{trait}:</span>
                          <span className="font-medium">{score}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Taken on: {formatDate(test.date)}</p>
                      {test.duration && <p>Duration: {test.duration} minutes</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Test Details */}
        {selectedTest && (
          <div ref={selectedTestRef} className="bg-white p-6 rounded-lg shadow-lg border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-700">Selected Test Details</h3>
              <span className="bg-green-100 px-3 py-1 rounded-full text-sm text-green-700">
                {formatDate(selectedTest.date)}
              </span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="text-lg mb-2">Personality Type: <span className="font-bold text-green-700">{selectedTest.personalityType}</span></div>
              {selectedTest.description && (
                <p className="text-gray-700">{selectedTest.description}</p>
              )}
            </div>

            {/* Bar Chart */}
            <h4 className="text-lg font-semibold text-green-700 mb-3">Trait Scores</h4>
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="trait" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }} />
                  <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar and Pie Charts side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-green-700 mb-3">Trait Radar</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={90} data={chartData}>
                      <PolarGrid stroke="#dcfce7" />
                      <PolarAngleAxis dataKey="trait" stroke="#4b5563" />
                      <PolarRadiusAxis stroke="#4b5563" />
                      <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-green-700 mb-3">Trait Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="score"
                        nameKey="trait"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ name, percent }) => `${name}`}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-center text-green-800">Share Your Results</h3>
            
            {screenshotUrl && (
              <div className="mb-6 border border-green-100 rounded-lg overflow-hidden">
                <img 
                  src={screenshotUrl} 
                  alt="Test results" 
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            )}
            
            <div className="flex justify-center gap-6 mb-8">
              <button 
                onClick={() => shareOnSocialMedia('twitter')}
                className="bg-blue-400 hover:bg-blue-500 text-white p-4 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => shareOnSocialMedia('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              
              <button 
                onClick={() => shareOnSocialMedia('linkedin')}
                className="bg-blue-800 hover:bg-blue-900 text-white p-4 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={downloadScreenshot}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
              >
                Download Image
              </button>
              
              <button
                onClick={closeShareModal}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;