import React, { useState, useEffect } from 'react';
import {
  FiBook, FiChevronDown, FiChevronRight, FiMenu, FiX,
  FiCode, FiLayers, FiDatabase, FiPlay, FiClock,
  FiCalendar, FiSearch, FiUser, FiDownload, FiFileText,
  FiVideo, FiImage, FiMusic, FiBox, FiLoader, FiEye,
  FiVideoOff, FiAward, FiBarChart2, FiCheckCircle
} from 'react-icons/fi';
import axios from "axios";
import Swal from "sweetalert2";

const CourseModuleInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState('');
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState('recorded');

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;
  console.log(userId)

  // Dummy data for PDFs and Quizzes
  const [pdfMaterials, setPdfMaterials] = useState([
    {
      id: 1,
      title: "React Fundamentals Guide",
      description: "Complete guide to React basics and core concepts",
      type: "pdf",
      size: "2.4 MB",
      pages: 45,
      downloadUrl: "#",
      icon: <FiFileText className="text-red-500" />
    },
    {
      id: 2,
      title: "JavaScript ES6+ Cheatsheet",
      description: "Quick reference for modern JavaScript features",
      type: "pdf",
      size: "1.2 MB",
      pages: 28,
      downloadUrl: "#",
      icon: <FiFileText className="text-blue-500" />
    },
    {
      id: 3,
      title: "CSS Grid & Flexbox Mastery",
      description: "Advanced layout techniques with examples",
      type: "pdf",
      size: "3.1 MB",
      pages: 52,
      downloadUrl: "#",
      icon: <FiFileText className="text-green-500" />
    },
    {
      id: 4,
      title: "Node.js Backend Development",
      description: "Building scalable backend applications",
      type: "pdf",
      size: "4.2 MB",
      pages: 67,
      downloadUrl: "#",
      icon: <FiFileText className="text-purple-500" />
    }
  ]);

  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: "JavaScript Basics Quiz",
      description: "Test your fundamental JavaScript knowledge",
      questions: 15,
      duration: "20 min",
      difficulty: "Beginner",
      completed: true,
      score: 85,
      icon: <FiAward className="text-yellow-500" />
    },
    {
      id: 2,
      title: "React Components Quiz",
      description: "Advanced React component patterns",
      questions: 20,
      duration: "30 min",
      difficulty: "Intermediate",
      completed: false,
      score: null,
      icon: <FiAward className="text-blue-500" />
    },
    {
      id: 3,
      title: "CSS Layout Challenge",
      description: "Master CSS Grid and Flexbox",
      questions: 12,
      duration: "25 min",
      difficulty: "Intermediate",
      completed: false,
      score: null,
      icon: <FiAward className="text-green-500" />
    },
    {
      id: 4,
      title: "Full Stack Development",
      description: "Comprehensive full-stack knowledge test",
      questions: 25,
      duration: "45 min",
      difficulty: "Advanced",
      completed: false,
      score: null,
      icon: <FiAward className="text-red-500" />
    }
  ]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.techsterker.com/api/course-modules/user/${userId}`);
        const data = await response.json();

        if (data.success) {
          const transformedCourses = data.data.map(course => ({
            id: course._id,
            name: course.enrolledId.batchName,
            instructor: course.mentorName,
            progress: 0,
            modules: course.modules.map(module => ({
              id: module._id,
              name: module.subjectName,
              icon: <FiCode className="textcolor" />,
              lessons: module.topics.flatMap(topic =>
                topic.lessons.map(lesson => ({
                  id: lesson._id,
                  name: lesson.name,
                  date: new Date(lesson.date).toISOString().split('T')[0],
                  duration: lesson.duration || '40 min',
                  videoId: lesson.videoId,
                  completed: false,
                  resources: lesson.resources ? lesson.resources.map(resource => ({
                    id: resource._id,
                    name: resource.name,
                    type: resource.file.split('.').pop(),
                    url: resource.file,
                    icon: <FiFileText className="textcolor" />,
                    isPdf: resource.file.includes('.pdf') || resource.name.toLowerCase().includes('pdf')
                  })) : []
                }))
              )
            }))
          }));

          setCoursesData(transformedCourses);
          if (transformedCourses.length > 0) {
            setSelectedCourse(transformedCourses[0].id);
          }
        } else {
          setError('Failed to fetch course data');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setError('User not found. Please log in again.');
      setLoading(false);
    }
  }, [userId]);

  const selectedCourseData = coursesData.find(c => c.id === selectedCourse);
  const modules = selectedCourseData?.modules || [];

  // Initialize expanded state for modules
  useEffect(() => {
    const initialExpandedState = {};
    modules.forEach(module => {
      initialExpandedState[module.id] = false;
    });
    setExpandedModules(initialExpandedState);
  }, [selectedCourse, coursesData]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setActiveSection('recorded');
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDownload = async (url, filename = "document.pdf") => {
    try {
      setDownloading(true);
      const response = await axios.get(url, { responseType: "blob" });
      const contentType = response.headers["content-type"] || "application/pdf";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/['"]/g, "");
      }

      const blob = new Blob([response.data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      Swal.fire("Success", "File downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading file:", error);
      Swal.fire("Error", "Failed to download the file. Try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const viewPdf = async (pdfUrl, pdfName) => {
    try {
      setCurrentPdf({ url: pdfUrl, name: pdfName });
      setPdfViewerOpen(true);
    } catch (error) {
      console.error('Error loading PDF:', error);
      Swal.fire("Error", "Failed to load PDF. Please try again.", "error");
    }
  };

  const startQuiz = (quizId) => {
    Swal.fire({
      title: `Start ${quizzes.find(q => q.id === quizId)?.title}?`,
      text: "You'll have limited time to complete the quiz.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Start Quiz",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Quiz Started!", "Good luck with your quiz!", "success");
      }
    });
  };

  const filteredModules = modules.map(module => {
    if (!searchTerm) return module;
    const filteredLessons = module.lessons.filter(lesson =>
      lesson.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredLessons.length ? { ...module, lessons: filteredLessons } : null;
  }).filter(Boolean);

  if (loading && !pdfViewerOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your learning materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiVideoOff className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Unable to Load Content
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (coursesData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiBook className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Courses Available</h2>
          <p className="text-gray-600">You are not enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* PDF Viewer Modal */}
      {pdfViewerOpen && currentPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{currentPdf.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(currentPdf.url, currentPdf.name)}
                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded"
                  disabled={downloading}
                >
                  {downloading ? (
                    <FiLoader className="h-5 w-5 animate-spin" />
                  ) : (
                    <FiDownload className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => setPdfViewerOpen(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={currentPdf.url}
                className="w-full h-full"
                title={currentPdf.name}
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors mr-3"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learning Platform
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search classes..."
              className="bg-transparent outline-none text-sm w-40 lg:w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`lg:w-80 lg:flex-shrink-0 ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-80' : 'hidden'} lg:relative lg:block bg-white/80 backdrop-blur-sm border-r border-gray-200`}>
          <div className="h-full flex flex-col">
            <div className="bg-white/80 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Courses Dropdown */}
              <div className="mt-3">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {coursesData.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Search */}
              <div className="mt-3 lg:hidden flex items-center bg-white rounded-lg px-3 py-2 border">
                <FiSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredModules.length > 0 ? (
                filteredModules.map(module => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-3 text-left bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {module.icon}
                        <span className="font-medium text-gray-800">{module.name}</span>
                      </div>
                      {expandedModules[module.id] ? <FiChevronDown className="h-4 w-4 text-gray-500" /> : <FiChevronRight className="h-4 w-4 text-gray-500" />}
                    </button>

                    {expandedModules[module.id] && (
                      <div className="border-t border-gray-100 bg-gray-50/80 divide-y divide-gray-200">
                        {module.lessons.map((classItem, index) => (
                          <button
                            key={classItem.id}
                            onClick={() => handleClassSelect(classItem)}
                            className={`w-full flex items-center p-3 text-left hover:bg-indigo-50 transition-colors ${selectedClass?.id === classItem.id ? 'bg-indigo-100' : ''}`}
                          >
                            <div className="ml-4 flex-1">
                              <div className="flex items-center">
                                <FiPlay className="h-3 w-3 text-indigo-600 mr-2" />
                                <span className="text-sm text-gray-700">{classItem.name}</span>
                                {classItem.completed && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                                )}
                              </div>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <FiCalendar className="h-3 w-3 mr-1 text-indigo-600" />
                                <span className="mr-3">{classItem.date}</span>
                                <FiClock className="h-3 w-3 mr-1 text-indigo-600" />
                                <span>{classItem.duration}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 bg-white/80 rounded-lg">
                  <p>No classes found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Section Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              {[
                { id: 'recorded', label: 'Recorded Classes', icon: <FiVideo className="w-4 h-4" /> },
                { id: 'pdf', label: 'Study Materials', icon: <FiFileText className="w-4 h-4" /> },
                { id: 'quizzes', label: 'Quizzes', icon: <FiAward className="w-4 h-4" /> }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all ${
                    activeSection === section.id 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Recorded Classes Section */}
            {activeSection === 'recorded' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {selectedClass ? (
                  <div className="flex flex-col h-full">
                    {/* Video & Info */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedClass.name}</h2>
                          <div className="flex items-center text-sm text-gray-600 flex-wrap gap-4">
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-2 text-indigo-600" />
                              <span>{selectedClass.date}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="h-4 w-4 mr-2 text-indigo-600" />
                              <span>{selectedClass.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Player */}
                    <div className="p-6">
                      <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedClass.videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1&disablekb=1`}
                          title={selectedClass.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-64 sm:h-72 md:h-80 lg:h-96"
                        ></iframe>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">About this class</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Learn and practice concepts with real-world examples. This session covers important topics that will help you master the subject. Take notes and explore additional resources provided below.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FiVideo className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Class</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Choose a class from the sidebar to start watching recorded sessions and enhance your learning experience.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PDF Materials Section */}
            {activeSection === 'pdf' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {pdfMaterials.length} Materials
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pdfMaterials.map(material => (
                    <div key={material.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            {material.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{material.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{material.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span>{material.size}</span>
                          <span>{material.pages} pages</span>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          PDF
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewPdf(material.downloadUrl, material.title)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>View PDF</span>
                        </button>
                        <button
                          onClick={() => handleDownload(material.downloadUrl, material.title)}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                          disabled={downloading}
                        >
                          {downloading ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiDownload className="w-4 h-4" />
                          )}
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes Section */}
            {activeSection === 'quizzes' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Knowledge Tests</h2>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {quizzes.length} Quizzes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gray-100 rounded-lg">
                            {quiz.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{quiz.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span>{quiz.questions} questions</span>
                          <span>{quiz.duration}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>

                      {quiz.completed ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FiCheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-800 font-medium">Completed</span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">{quiz.score}%</div>
                              <div className="text-xs text-green-600">Your Score</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startQuiz(quiz.id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <FiAward className="w-4 h-4" />
                          <span>Start Quiz</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModuleInterface;