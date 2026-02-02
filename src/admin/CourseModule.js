import React, { useState, useEffect } from 'react';
import {
  FiBook, FiChevronDown, FiChevronRight, FiMenu, FiX,
  FiCode, FiLayers, FiDatabase, FiPlay, FiClock,
  FiCalendar, FiSearch, FiUser, FiDownload, FiFileText,
  FiVideo, FiImage, FiMusic, FiBox, FiLoader, FiEye,
  FiVideoOff, FiAward, FiBarChart2, FiCheckCircle,
  FiArrowLeft, FiSend, FiAlertCircle, FiStar, FiFile, 
  FiInfo, FiExternalLink, FiCast, FiRadio, FiVideo as FiLiveVideo
} from 'react-icons/fi';
import axios from "axios";
import Swal from "sweetalert2";

const CourseModuleInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState('recorded');
  
  // Quiz States
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizTimer, setQuizTimer] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Live Classes Materials States
  const [liveClasses, setLiveClasses] = useState([]);
  const [liveClassesLoading, setLiveClassesLoading] = useState(false);
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);
  const [liveMaterialsModalOpen, setLiveMaterialsModalOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;
  const userName = user.name || 'Student';

  // Fetch data from API - MULTIPLE FALLBACK URLs
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try multiple API endpoints
        const apiEndpoints = [
          `https://api.techsterker.com/api/course-modules/user/${userId}`,
          `https://api.techsterker.com/api/courses/user/${userId}`,
          `https://api.techsterker.com/api/user/courses/${userId}`,
          `https://api.techsterker.com/api/user/${userId}/courses`
        ];

        let data = null;
        let apiUsed = '';

        // Try each endpoint until one works
        for (const endpoint of apiEndpoints) {
          try {
            console.log(`Trying API endpoint: ${endpoint}`);
            const response = await fetch(endpoint);
            
            if (response.ok) {
              data = await response.json();
              apiUsed = endpoint;
              console.log(`Success with endpoint: ${endpoint}`, data);
              break;
            } else {
              console.log(`Endpoint ${endpoint} failed with status: ${response.status}`);
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} error:`, err.message);
          }
        }

        // If no API worked, try local fallback data
        if (!data) {
          console.log('All APIs failed, using fallback data');
          // Use fallback mock data for demonstration
          data = {
            success: true,
            data: [
              {
                _id: 'course1',
                enrolledId: {
                  batchName: 'Web Development Bootcamp',
                  _id: 'course1_id'
                },
                mentorName: 'John Doe',
                modules: [
                  {
                    _id: 'module1',
                    subjectName: 'HTML & CSS',
                    topics: [
                      {
                        lessons: [
                          {
                            _id: 'lesson1',
                            name: 'Introduction to HTML',
                            date: '2024-01-15',
                            duration: '45 min',
                            videoId: 'dQw4w9WgXcQ',
                            resources: [
                              {
                                _id: 'res1',
                                name: 'HTML Cheatsheet.pdf',
                                file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                              }
                            ]
                          },
                          {
                            _id: 'lesson2',
                            name: 'CSS Fundamentals',
                            date: '2024-01-16',
                            duration: '50 min',
                            videoId: 'dQw4w9WgXcQ'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    _id: 'module2',
                    subjectName: 'JavaScript',
                    topics: [
                      {
                        lessons: [
                          {
                            _id: 'lesson3',
                            name: 'JavaScript Basics',
                            date: '2024-01-17',
                            duration: '60 min',
                            videoId: 'dQw4w9WgXcQ',
                            resources: [
                              {
                                _id: 'res2',
                                name: 'JS Exercises.zip',
                                file: 'https://example.com/file.zip'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          };
          apiUsed = 'fallback';
        }

        // Process the data
        if (data && data.success && data.data && Array.isArray(data.data)) {
          const transformedCourses = data.data.map(course => {
            // Check if required fields exist
            if (!course.enrolledId || !course.modules) {
              console.warn('Invalid course data:', course);
              return null;
            }
            
            return {
              id: course._id,
              name: course.enrolledId.batchName || 'Unnamed Course',
              instructor: course.mentorName || 'Unknown Instructor',
              progress: 0,
              courseId: course.enrolledId._id,
              modules: course.modules.map(module => {
                if (!module.topics) {
                  console.warn('Module without topics:', module);
                  return {
                    id: module._id,
                    name: module.subjectName || 'Unnamed Module',
                    icon: <FiCode className="textcolor" />,
                    lessons: []
                  };
                }
                
                return {
                  id: module._id,
                  name: module.subjectName || 'Unnamed Module',
                  icon: <FiCode className="textcolor" />,
                  lessons: module.topics.flatMap(topic => {
                    if (!topic.lessons || !Array.isArray(topic.lessons)) {
                      return [];
                    }
                    
                    return topic.lessons.map(lesson => ({
                      id: lesson._id,
                      name: lesson.name || 'Unnamed Lesson',
                      date: lesson.date ? new Date(lesson.date).toISOString().split('T')[0] : 'No date',
                      duration: lesson.duration || '40 min',
                      videoId: lesson.videoId,
                      completed: false,
                      resources: lesson.resources ? lesson.resources.map(resource => ({
                        id: resource._id,
                        name: resource.name || 'Unnamed Resource',
                        type: resource.file ? resource.file.split('.').pop() : 'unknown',
                        url: resource.file || '#',
                        icon: <FiFileText className="textcolor" />,
                        isPdf: resource.file ? (resource.file.includes('.pdf') || resource.name.toLowerCase().includes('pdf')) : false
                      })) : []
                    }));
                  })
                };
              })
            };
          }).filter(Boolean); // Remove null courses

          console.log('Transformed courses:', transformedCourses);
          console.log('API used:', apiUsed);

          setCoursesData(transformedCourses);
          if (transformedCourses.length > 0) {
            setSelectedCourse(transformedCourses[0].id);
            // Fetch quizzes for the first course
            fetchQuizzes(transformedCourses[0].courseId);
          }
          
          // Show info if using fallback
          if (apiUsed === 'fallback') {
            Swal.fire({
              title: 'Demo Mode',
              text: 'Using demo data. Real API is not available.',
              icon: 'info',
              timer: 3000
            });
          }
        } else {
          setError('Failed to fetch course data or no data available');
          setCoursesData([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data: ' + err.message);
        setCoursesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Fetch live classes for the user
    fetchLiveClasses();
  }, [userId]);

  // Fetch quizzes for the selected course - WITH FALLBACK
  const fetchQuizzes = async (courseId) => {
    if (!userId || !courseId) return;
    
    setQuizLoading(true);
    try {
      // Try multiple quiz API endpoints
      const quizEndpoints = [
        `http://localhost:5001/api/myquizz/${userId}?courseId=${courseId}`,
        `https://api.techsterker.com/api/quizzes/${userId}?courseId=${courseId}`,
        `https://api.techsterker.com/api/user/${userId}/quizzes?courseId=${courseId}`
      ];

      let quizData = null;

      for (const endpoint of quizEndpoints) {
        try {
          console.log(`Trying quiz endpoint: ${endpoint}`);
          const response = await axios.get(endpoint);
          if (response.data) {
            quizData = response.data;
            console.log(`Quiz data from ${endpoint}:`, quizData);
            break;
          }
        } catch (err) {
          console.log(`Quiz endpoint ${endpoint} failed:`, err.message);
        }
      }

      // If no quiz API worked, use fallback quizzes
      if (!quizData) {
        console.log('Using fallback quiz data');
        quizData = {
          quizzes: [
            {
              _id: 'quiz1',
              title: 'HTML Basics Quiz',
              description: 'Test your HTML knowledge',
              questions: [
                {
                  _id: 'q1',
                  question: 'What does HTML stand for?',
                  points: 1,
                  options: [
                    'Hyper Text Markup Language',
                    'High Tech Modern Language',
                    'Hyper Transfer Markup Language',
                    'Home Tool Markup Language'
                  ],
                  correctAnswer: 'Hyper Text Markup Language'
                },
                {
                  _id: 'q2',
                  question: 'Which tag is used for the largest heading?',
                  points: 1,
                  options: ['<h1>', '<h6>', '<head>', '<heading>'],
                  correctAnswer: '<h1>'
                }
              ]
            },
            {
              _id: 'quiz2',
              title: 'CSS Fundamentals Quiz',
              description: 'Test your CSS skills',
              questions: [
                {
                  _id: 'q3',
                  question: 'What does CSS stand for?',
                  points: 1,
                  options: [
                    'Cascading Style Sheets',
                    'Computer Style Sheets',
                    'Creative Style System',
                    'Colorful Style Sheets'
                  ],
                  correctAnswer: 'Cascading Style Sheets'
                }
              ]
            }
          ]
        };
      }
      
      if (quizData && quizData.quizzes && Array.isArray(quizData.quizzes)) {
        const quizzesWithProgress = quizData.quizzes.map(quiz => {
          // Load previous progress from localStorage
          const savedProgress = JSON.parse(localStorage.getItem(`quiz_progress_${quiz._id}_${userId}`) || '{}');
          return {
            ...quiz,
            completed: savedProgress.completed || false,
            score: savedProgress.score || null,
            attemptDate: savedProgress.attemptDate || null,
            totalQuestions: quiz.questions?.length || 0,
            totalPoints: quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0
          };
        });
        setQuizzes(quizzesWithProgress);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setQuizzes([]);
    } finally {
      setQuizLoading(false);
    }
  };

  // Fetch live classes for the user - WITH ERROR HANDLING AND FALLBACK
  const fetchLiveClasses = async () => {
    if (!userId) return;
    
    setLiveClassesLoading(true);
    try {
      const response = await axios.get(`https://api.techsterker.com/api/live-classes/user/${userId}`);
      
      console.log('Live classes API response:', response.data);
      
      // Check if success is true AND data exists
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        setLiveClasses(response.data.data);
      } else if (!response.data.success && response.data.message === "No live classes found for this user") {
        // If no live classes found, set empty array - this is NOT an error
        setLiveClasses([]);
        console.log('No live classes found for user');
      } else {
        // Show warning only for actual errors, not for "no data found"
        console.warn('Live classes API warning:', response.data.message);
        setLiveClasses([]);
      }
    } catch (err) {
      console.error('Error fetching live classes:', err);
      // Don't show error alert for fetch failures, just log and set empty array
      setLiveClasses([]);
    } finally {
      setLiveClassesLoading(false);
    }
  };

  // Handle course change
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    const course = coursesData.find(c => c.id === courseId);
    if (course) {
      fetchQuizzes(course.courseId);
    }
  };

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
      
      // If URL is a Cloudinary URL, we need to handle it differently
      if (url.includes('cloudinary.com')) {
        // Create a direct download link
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Swal.fire("Success", "File download started!", "success");
      } else {
        // For other URLs, use axios to download
        const response = await axios.get(url, { responseType: "blob" });
        const contentType = response.headers["content-type"] || "application/octet-stream";
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition && contentDisposition.includes("filename=")) {
          filename = contentDisposition.split("filename=")[1].replace(/['"]/g, "");
        }

        const blob = new Blob([response.data], { type: contentType });
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        Swal.fire("Success", "File downloaded successfully!", "success");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      
      // Fallback method
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Swal.fire("Info", "File download started in new tab", "info");
      } catch (fallbackError) {
        Swal.fire("Error", "Failed to download the file. Try again.", "error");
      }
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

  // Live Classes Materials Functions
  const handleLiveClassSelect = (liveClass) => {
    setSelectedLiveClass(liveClass);
  };

  const openLiveMaterialsModal = (liveClass) => {
    setSelectedLiveClass(liveClass);
    setLiveMaterialsModalOpen(true);
  };

  const getLiveClassFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp', 'svg'].includes(ext)) {
      return <FiImage className="text-green-600" size={20} />;
    } else if (['pdf'].includes(ext)) {
      return <FiFileText className="text-red-600" size={20} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FiFile className="text-blue-600" size={20} />;
    } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
      return <FiVideo className="text-purple-600" size={20} />;
    } else if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) {
      return <FiMusic className="text-yellow-600" size={20} />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FiBox className="text-gray-600" size={20} />;
    } else if (['ppt', 'pptx'].includes(ext)) {
      return <FiFile className="text-orange-600" size={20} />;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FiFile className="text-green-700" size={20} />;
    } else {
      return <FiFile className="text-gray-500" size={20} />;
    }
  };

  const formatLiveClassDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatLiveClassTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getMentorName = (liveClass) => {
    if (liveClass.enrollmentIdRef?.assignedMentors?.length > 0) {
      const mentor = liveClass.enrollmentIdRef.assignedMentors[0];
      return `${mentor.firstName} ${mentor.lastName}`;
    }
    return 'Mentor Not Assigned';
  };

  const getCourseName = (liveClass) => {
    return liveClass.enrollmentIdRef?.courseId?.name || 'Course Not Available';
  };

  // Quiz Functions
  const startQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setQuizResult(null);
    setIsQuizModalOpen(true);
    
    // Set timer (1 minute per question)
    const totalTime = quiz.questions.length * 60;
    setQuizTimer(totalTime);
    
    // Start timer
    const timerInterval = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleQuizSubmit(); // Auto submit when time ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedQuiz.questions.length - 1)) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedQuiz) return;
    
    // Prepare answers object in format: { questionId: selectedOption }
    const answers = {};
    Object.keys(quizAnswers).forEach(questionId => {
      answers[questionId] = quizAnswers[questionId];
    });

    try {
      // Try to submit to API
      const response = await axios.post(
        `https://api.techsterker.com/api/submit-quiz/${selectedQuiz._id}/${userId}`,
        { answers }
      );

      const result = response.data;
      
      setQuizResult(result);
      setQuizSubmitted(true);
      
      // Save progress to localStorage
      const progress = {
        completed: true,
        score: result.summary.percentage,
        totalScore: result.summary.totalScore,
        totalPoints: result.summary.totalPossiblePoints,
        correct: result.summary.correct,
        totalQuestions: result.summary.totalQuestions,
        attemptDate: new Date().toISOString(),
        detailedResults: result.results
      };
      
      localStorage.setItem(`quiz_progress_${selectedQuiz._id}_${userId}`, JSON.stringify(progress));
      
      // Update quizzes state
      setQuizzes(prev => prev.map(q => 
        q._id === selectedQuiz._id 
          ? { 
              ...q, 
              completed: true, 
              score: result.summary.percentage,
              totalScore: result.summary.totalScore,
              correctAnswers: result.summary.correct,
              attemptDate: new Date().toISOString(),
              detailedResults: result.results
            }
          : q
      ));
      
      // Show congratulatory popup
      showCongratulatoryPopup(result);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      // If API fails, use local calculation
      const mockResult = calculateQuizResult(selectedQuiz, answers);
      setQuizResult(mockResult);
      setQuizSubmitted(true);
      
      // Save progress to localStorage
      const progress = {
        completed: true,
        score: mockResult.summary.percentage,
        totalScore: mockResult.summary.totalScore,
        totalPoints: mockResult.summary.totalPossiblePoints,
        correct: mockResult.summary.correct,
        totalQuestions: mockResult.summary.totalQuestions,
        attemptDate: new Date().toISOString(),
        detailedResults: mockResult.results
      };
      
      localStorage.setItem(`quiz_progress_${selectedQuiz._id}_${userId}`, JSON.stringify(progress));
      
      // Update quizzes state
      setQuizzes(prev => prev.map(q => 
        q._id === selectedQuiz._id 
          ? { 
              ...q, 
              completed: true, 
              score: mockResult.summary.percentage,
              totalScore: mockResult.summary.totalScore,
              correctAnswers: mockResult.summary.correct,
              attemptDate: new Date().toISOString(),
              detailedResults: mockResult.results
            }
          : q
      ));
      
      // Show congratulatory popup
      showCongratulatoryPopup(mockResult);
    }
  };

  // Calculate quiz result locally
  const calculateQuizResult = (quiz, answers) => {
    let correct = 0;
    let totalScore = 0;
    let totalPossiblePoints = 0;
    let attempted = 0;
    
    const results = quiz.questions.map(question => {
      const userAnswer = answers[question._id];
      const isCorrect = userAnswer === question.correctAnswer;
      const points = question.points || 1;
      
      totalPossiblePoints += points;
      
      if (userAnswer) {
        attempted++;
        if (isCorrect) {
          correct++;
          totalScore += points;
        }
      }
      
      return {
        question: question.question,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        status: userAnswer ? (isCorrect ? 'correct' : 'incorrect') : 'not_attempted',
        points: points
      };
    });
    
    const percentage = totalPossiblePoints > 0 ? Math.round((totalScore / totalPossiblePoints) * 100) : 0;
    
    return {
      summary: {
        percentage,
        totalScore,
        totalPossiblePoints,
        correct,
        totalQuestions: quiz.questions.length,
        attempted,
        incorrect: attempted - correct,
        grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'
      },
      results
    };
  };

  const showCongratulatoryPopup = (result) => {
    Swal.fire({
      title: '🎉 Congratulations!',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 72px; margin-bottom: 20px;">🏆</div>
          <h3 style="color: #10B981; font-size: 28px; font-weight:bold; margin-bottom: 15px;">
            Quiz Submitted Successfully!
          </h3>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     padding: 25px; border-radius: 15px; color: white; margin: 20px 0;">
            <div style="font-size: 42px; font-weight: bold; margin-bottom: 10px;">
              ${result.summary.percentage}%
            </div>
            <div style="font-size: 18px; opacity: 0.9;">Overall Score</div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: #EFF6FF; padding: 15px; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">
                ${result.summary.correct}/${result.summary.totalQuestions}
              </div>
              <div style="font-size: 14px; color: #6B7280;">Correct Answers</div>
            </div>
            
            <div style="background: #ECFDF5; padding: 15px; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #10B981;">
                ${result.summary.totalScore}/${result.summary.totalPossiblePoints}
              </div>
              <div style="font-size: 14px; color: #6B7280;">Points Earned</div>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius= 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #F59E0B;">
                ${result.summary.attempted}/${result.summary.totalQuestions}
              </div>
              <div style="font-size: 14px; color: #6B7280;">Questions Attempted</div>
            </div>
            
            <div style="background: #FEE2E2; padding: 15px; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #EF4444;">
                ${result.summary.incorrect || 0}
              </div>
              <div style="font-size: 14px; color: #6B7280;">Wrong Answers</div>
            </div>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: #F3F4F6; border-radius: 10px;">
            <p style="font-size: 16px; color: #4B5563; margin-bottom: 10px;">
              <strong>Grade:</strong> ${result.summary.grade || 'A+'}
            </p>
            <p style="font-size: 14px; color: #6B7280; font-style: italic;">
              "Great effort! Keep learning and improving!"
            </p>
          </div>
          
          <div style="margin-top: 20px; font-size: 14px; color: #9CA3AF;">
            Submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `,
      width: 600,
      padding: '2em',
      background: '#fff',
      backdrop: `
        rgba(0, 0, 0, 0.4)
        url("https://sweetalert2.github.io/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      showConfirmButton: true,
      confirmButtonText: 'View Detailed Results',
      confirmButtonColor: '#3B82F6',
      showCancelButton: true,
      cancelButtonText: 'Close',
      customClass: {
        popup: 'border-4 border-yellow-400 shadow-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // User wants to see detailed results (already shown in modal)
      }
    });
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setQuizResult(null);
    setIsQuizModalOpen(false);
    setSelectedQuiz(null);
  };

  const closeQuizModal = () => {
    if (!quizSubmitted) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Your progress will be lost if you exit now.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, exit',
        cancelButtonText: 'No, continue'
      }).then((result) => {
        if (result.isConfirmed) {
          setIsQuizModalOpen(false);
          setSelectedQuiz(null);
          setQuizAnswers({});
        }
      });
    } else {
      setIsQuizModalOpen(false);
      setSelectedQuiz(null);
      setQuizAnswers({});
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Study Materials Functions
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'].includes(ext)) {
      return <FiImage className="text-green-600" />;
    } else if (['pdf'].includes(ext)) {
      return <FiFileText className="text-red-600" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FiFile className="text-blue-600" />;
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
      return <FiVideo className="text-purple-600" />;
    } else if (['mp3', 'wav', 'm4a'].includes(ext)) {
      return <FiMusic className="text-yellow-600" />;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return <FiBox className="text-gray-600" />;
    } else {
      return <FiFile className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredModules = modules.map(module => {
    if (!searchTerm) return module;
    const filteredLessons = module.lessons.filter(lesson =>
      lesson.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredLessons.length ? { ...module, lessons: filteredLessons } : null;
  }).filter(Boolean);

  // Render loading state
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

  // Render error state
  if (error && coursesData.length === 0) {
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

  // Render no courses state
  if (coursesData.length === 0 && !loading) {
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

  // Main render
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

      {/* Quiz Modal */}
      {isQuizModalOpen && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                  <p className="text-blue-100 opacity-90">{selectedQuiz.description}</p>
                </div>
                <button
                  onClick={closeQuizModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="font-semibold">Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${quizTimer < 60 ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="font-bold">{formatTime(quizTimer)}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-48 bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 font-semibold">
                    {Math.round(((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!quizSubmitted ? (
                <>
                  {/* Current Question */}
                  <div className="mb-8">
                    <div className="flex items-start mb-6">
                      <div className="bg-blue-100 text-blue-800 rounded-lg w-12 h-12 flex items-center justify-center mr-4 font-bold text-xl">
                        {currentQuestionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {selectedQuiz.questions[currentQuestionIndex].question}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            Points: {selectedQuiz.questions[currentQuestionIndex].points || 1}
                          </span>
                          <span className="text-gray-500 text-sm">
                            Select one correct answer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 ml-16">
                      {selectedQuiz.questions[currentQuestionIndex].options.map((option, index) => {
                        const questionId = selectedQuiz.questions[currentQuestionIndex]._id;
                        const isSelected = quizAnswers[questionId] === option;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(questionId, option)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="text-lg">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`px-6 py-3 rounded-lg flex items-center ${
                        currentQuestionIndex === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FiArrowLeft className="mr-2" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      {Object.keys(quizAnswers).length > 0 && (
                        <span className="text-green-600 font-medium">
                          {Object.keys(quizAnswers).length} of {selectedQuiz.questions.length} answered
                        </span>
                      )}
                      
                      {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          Next Question
                          <FiChevronRight className="ml-2" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: 'Submit Quiz?',
                              text: 'Are you sure you want to submit your answers?',
                              icon: 'question',
                              showCancelButton: true,
                              confirmButtonText: 'Yes, submit',
                              cancelButtonText: 'Review answers'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleQuizSubmit();
                              }
                            });
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <FiSend className="mr-2" />
                          Submit Quiz
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Navigator */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Question Navigator</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {selectedQuiz.questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`h-10 rounded-lg flex items-center justify-center ${
                            currentQuestionIndex === index
                              ? 'bg-blue-600 text-white'
                              : quizAnswers[selectedQuiz.questions[index]?._id]
                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Quiz Results */
                <div className="py-8">
                  <div className="text-center mb-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
                      <FiAward className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
                    <p className="text-gray-600">Your results are ready</p>
                  </div>

                  {quizResult && (
                    <>
                      {/* Score Card */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-blue-600 mb-2">
                              {quizResult.summary?.percentage}%
                            </div>
                            <div className="text-gray-600">Overall Score</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {quizResult.summary?.correct}/${quizResult.summary?.totalQuestions}
                            </div>
                            <div className="text-gray-600">Correct Answers</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                              {quizResult.summary?.totalScore}/${quizResult.summary?.totalPossiblePoints}
                            </div>
                            <div className="text-gray-600">Points Earned</div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-blue-200">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                              style={{ width: `${quizResult.summary?.percentage || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Results */}
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Detailed Results</h4>
                        <div className="space-y-4">
                          {quizResult.results && quizResult.results.map((result, index) => {
                            const isCorrect = result.status === 'correct';
                            
                            return (
                              <div key={index} className={`p-4 rounded-xl border-2 ${
                                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-start">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800">{result.question}</h5>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center">
                                          <span className="text-sm text-gray-600 mr-3">Your answer:</span>
                                          <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.userAnswer || 'Not answered'}
                                          </span>
                                        </div>
                                        {!isCorrect && (
                                          <div className="flex items-center">
                                            <span className="text-sm text-gray-600 mr-3">Correct answer:</span>
                                            <span className="font-medium text-green-600">{result.correctAnswer}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {result.points} point{result.points !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetQuiz}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={closeQuizModal}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Class Materials Modal */}
      {liveMaterialsModalOpen && selectedLiveClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLiveClass.className}</h2>
                  <p className="text-purple-100 opacity-90">{selectedLiveClass.subjectName}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" />
                      {formatLiveClassDate(selectedLiveClass.date)}
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" />
                      {selectedLiveClass.timing}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setLiveMaterialsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedLiveClass.materials && selectedLiveClass.materials.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Class Materials ({selectedLiveClass.materials.length} files)
                    </h3>
                    <p className="text-gray-600">
                      All materials shared during the live class are available for download.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedLiveClass.materials.map((material, index) => (
                      <div key={material._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            {getLiveClassFileIcon(material.fileName)}
                          </div>
                          <div>
                            <h6 className="font-semibold text-gray-900">{material.fileName}</h6>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                {formatLiveClassDate(material.uploadedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock size={14} />
                                {formatLiveClassTime(material.uploadedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {material.fileUrl && (
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                            >
                              <FiEye size={16} />
                              View
                            </a>
                          )}
                          
                          {material.fileUrl && (
                            <button
                              onClick={() => handleDownload(material.fileUrl, material.fileName)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 rounded-lg font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2"
                              disabled={downloading}
                            >
                              {downloading ? (
                                <FiLoader className="animate-spin" size={16} />
                              ) : (
                                <FiDownload size={16} />
                              )}
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-2">No Materials Available</h4>
                  <p className="text-gray-500">No materials were shared in this live class.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  All materials are provided by the instructor
                </span>
                <button
                  onClick={() => setLiveMaterialsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <FiUser className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">{userName}</span>
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
                  onChange={(e) => handleCourseChange(e.target.value)}
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
                              {classItem.resources && classItem.resources.length > 0 && (
                                <div className="flex items-center mt-1 text-xs text-blue-600">
                                  <FiFileText className="h-3 w-3 mr-1" />
                                  <span>{classItem.resources.length} resource(s)</span>
                                </div>
                              )}
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
                { id: 'live', label: 'Live Class Materials', icon: <FiLiveVideo className="w-4 h-4" /> },
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

            {/* Study Materials Section */}
            {activeSection === 'pdf' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {selectedClass ? (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
                        <p className="text-gray-600 mt-1">
                          Resources for: <span className="font-semibold text-indigo-700">{selectedClass.name}</span>
                        </p>
                      </div>
                      {selectedClass.resources && selectedClass.resources.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {selectedClass.resources.length} file(s)
                        </span>
                      )}
                    </div>

                    {selectedClass.resources && selectedClass.resources.length > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center">
                            <FiInfo className="w-5 h-5 text-blue-600 mr-3" />
                            <p className="text-sm text-blue-700">
                              All study materials are provided by your instructor. You can view or download them for offline use.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {selectedClass.resources.map((resource, index) => (
                            <div key={resource.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                              <div className="flex items-start mb-4">
                                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                                  {getFileIcon(resource.name)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-lg mb-1 truncate">{resource.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {resource.type.toUpperCase()} file
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Added: {formatDate(resource.uploadedAt || selectedClass.date)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex space-x-3">
                                {resource.isPdf ? (
                                  <button
                                    onClick={() => viewPdf(resource.url, resource.name)}
                                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                  >
                                    <FiEye className="mr-2" /> View
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                  >
                                    <FiExternalLink className="mr-2" /> Open
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownload(resource.url, resource.name)}
                                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                  disabled={downloading}
                                >
                                  {downloading ? (
                                    <FiLoader className="mr-2 animate-spin" />
                                  ) : (
                                    <FiDownload className="mr-2" />
                                  )}
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FiFileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Study Materials</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          There are no study materials available for this class yet. Check back later or contact your instructor.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FiFileText className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Class</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Choose a class from the sidebar to view study materials, PDFs, and other resources.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Live Class Materials Section */}
            {activeSection === 'live' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Live Class Materials</h2>
                      <p className="text-gray-600 mt-1">
                        All materials shared during your live sessions
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {liveClasses.length} Live Classes
                    </span>
                  </div>

                  {liveClassesLoading ? (
                    <div className="text-center py-12">
                      <FiLoader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading live classes...</p>
                    </div>
                  ) : liveClasses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiLiveVideo className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Live Classes Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        You don't have any live classes scheduled yet. Live classes will appear here when scheduled.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center">
                          <FiInfo className="w-5 h-5 text-purple-600 mr-3" />
                          <p className="text-sm text-purple-700">
                            All materials shared during your live classes are available here. You can view and download them.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveClasses.map((liveClass, index) => {
                          const hasMaterials = liveClass.materials && liveClass.materials.length > 0;
                          const mentorName = getMentorName(liveClass);
                          const courseName = getCourseName(liveClass);
                          
                          return (
                            <div key={liveClass._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-lg mb-1">{liveClass.className}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{liveClass.subjectName}</p>
                                  
                                  <div className="space-y-2 mb-3">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FiCalendar className="h-3 w-3 mr-1" />
                                      <span>{formatLiveClassDate(liveClass.date)}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FiClock className="h-3 w-3 mr-1" />
                                      <span>{liveClass.timing}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FiUser className="h-3 w-3 mr-1" />
                                      <span>{mentorName}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-blue-600">
                                      <FiBook className="h-3 w-3 mr-1" />
                                      <span>{courseName}</span>
                                    </div>
                                  </div>
                                  
                                  {hasMaterials && (
                                    <div className="flex items-center text-sm text-green-600">
                                      <FiFileText className="h-4 w-4 mr-2" />
                                      <span>{liveClass.materials.length} material(s) available</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="ml-2">
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                    Live
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                  <span className="block">
                                    Materials: {hasMaterials ? 'Available' : 'Not Available'}
                                  </span>
                                </div>
                                
                                <div className="flex space-x-2">
                                  {liveClass.link && (
                                    <a
                                      href={liveClass.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                      <FiVideo className="h-3 w-3 mr-1" />
                                      Join
                                    </a>
                                  )}
                                  
                                  {hasMaterials && (
                                    <button
                                      onClick={() => openLiveMaterialsModal(liveClass)}
                                      className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                    >
                                      <FiDownload className="h-3 w-3 mr-1" />
                                      Materials
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Live Class Statistics */}
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Classes Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                            <div className="flex items-center">
                              <div className="p-3 bg-blue-500 rounded-lg mr-4">
                                <FiLiveVideo className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-700">
                                  {liveClasses.length}
                                </div>
                                <div className="text-sm text-blue-600">Total Live Classes</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                            <div className="flex items-center">
                              <div className="p-3 bg-green-500 rounded-lg mr-4">
                                <FiFileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-green-700">
                                  {liveClasses.reduce((sum, lc) => sum + (lc.materials?.length || 0), 0)}
                                </div>
                                <div className="text-sm text-green-600">Total Materials</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                            <div className="flex items-center">
                              <div className="p-3 bg-purple-500 rounded-lg mr-4">
                                <FiAward className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-purple-700">
                                  {liveClasses.filter(lc => lc.materials?.length > 0).length}
                                </div>
                                <div className="text-sm text-purple-600">Classes with Materials</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quizzes Section */}
            {activeSection === 'quizzes' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Knowledge Tests</h2>
                    <p className="text-gray-600 mt-1">
                      Test your understanding with these quizzes
                    </p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {quizzes.length} Quizzes
                  </span>
                </div>

                {quizLoading ? (
                  <div className="text-center py-12">
                    <FiLoader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading quizzes...</p>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiAward className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quizzes Available</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      There are no quizzes available for this course yet. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {quizzes.map(quiz => {
                      const completed = quiz.completed || false;
                      const score = quiz.score || 0;
                      
                      return (
                        <div key={quiz._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-3 rounded-lg ${completed ? 'bg-green-100' : 'bg-purple-100'}`}>
                                <FiAward className={`h-6 w-6 ${completed ? 'text-green-600' : 'text-purple-600'}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-lg">{quiz.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-700">{quiz.totalQuestions}</div>
                              <div className="text-xs text-blue-600">Questions</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-700">{quiz.totalPoints}</div>
                              <div className="text-xs text-green-600">Total Points</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                            <div className="flex items-center space-x-2">
                              <FiClock className="w-4 h-4" />
                              <span>{Math.ceil(quiz.totalQuestions * 1.5)} min</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {completed ? 'Completed' : 'Not Attempted'}
                            </span>
                          </div>

                          {completed ? (
                            <div className="space-y-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">Attempted</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">{score}%</div>
                                    <div className="text-xs text-green-600">Your Score</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => startQuiz(quiz)}
                                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                  Retake Quiz
                                </button>
                                <button
                                  onClick={() => {
                                    const progress = JSON.parse(localStorage.getItem(`quiz_progress_${quiz._id}_${userId}`) || '{}');
                                    Swal.fire({
                                      title: 'Quiz Results',
                                      html: `
                                        <div class="text-left">
                                          <p><strong>Score:</strong> ${progress.score || 0}%</p>
                                          <p><strong>Correct Answers:</strong> ${progress.correct || 0}/${progress.totalQuestions || 0}</p>
                                          <p><strong>Attempt Date:</strong> ${progress.attemptDate ? new Date(progress.attemptDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                      `,
                                      icon: 'info'
                                    });
                                  }}
                                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startQuiz(quiz)}
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                            >
                              <FiAward className="w-5 h-5" />
                              <span className="font-medium">Start Quiz</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quiz Statistics */}
                {quizzes.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Quiz Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-500 rounded-lg mr-4">
                            <FiAward className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-700">
                              {quizzes.filter(q => q.completed).length}/{quizzes.length}
                            </div>
                            <div className="text-sm text-blue-600">Quizzes Completed</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-500 rounded-lg mr-4">
                            <FiBarChart2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-700">
                              {quizzes.filter(q => q.completed).length > 0 
                                ? Math.round(quizzes.filter(q => q.completed).reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.filter(q => q.completed).length)
                                : 0
                              }%
                            </div>
                            <div className="text-sm text-green-600">Average Score</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                        <div className="flex items-center">
                          <div className="p-3 bg-purple-500 rounded-lg mr-4">
                            <FiCheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-700">
                              {quizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0)}
                            </div>
                            <div className="text-sm text-purple-600">Total Questions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModuleInterface;