import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseEnquiryModal from '../components/EnrollModal';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todaysClassesCount, setTodaysClassesCount] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [prefillCourse, setPrefillCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [quizPerformance, setQuizPerformance] = useState(null);

  const Student = JSON.parse(sessionStorage.getItem('user') || '{}');
  const UserId = Student.id;
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    if (UserId) {
      fetchAllData();
    }
  }, [UserId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEnrollments(),
        fetchUserDetails(),
        fetchTodaysClassesData(),
        fetchCalendarEvents(),
        fetchAttendanceData(),
        fetchQuizPerformance()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/userenrollments/${UserId}`);
      const enrolledCoursesData = response.data.enrolledCourses || [];
      setEnrolledCourses(enrolledCoursesData);
      
      // Extract mentors from all enrolled courses and remove duplicates
      const allMentors = enrolledCoursesData.flatMap(course => course.mentors || []);
      const uniqueMentors = allMentors.filter((mentor, index, self) => 
        index === self.findIndex(m => m._id === mentor._id)
      );
      setMentors(uniqueMentors);
      // Select first mentor by default
      if (uniqueMentors.length > 0) {
        setSelectedMentor(uniqueMentors[0]);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrolledCourses([]);
      setMentors([]);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/userregister/${UserId}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchTodaysClassesData = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/live-classes/user/${UserId}`);
      if (response.data.success) {
        const today = new Date().toDateString();
        const todaysClassesData = response.data.data.filter(cls => {
          const classDate = new Date(cls.date).toDateString();
          return classDate === today;
        });
        setTodaysClassesCount(todaysClassesData.length);
        setTodaysClasses(todaysClassesData.slice(0, 2));
      }
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      setTodaysClassesCount(0);
      setTodaysClasses([]);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await axios.get("https://api.techsterker.com/api/calendars");
      if (response.data.success) {
        setCalendarEvents(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setCalendarEvents([]);
    }
  };

  const fetchAttendanceData = async () => {
    // Calculate completed and pending from enrolled courses
    const mockAttendance = enrolledCourses.map(course => ({
      course: course.courseId?.name || "Course",
      attended: Math.floor(Math.random() * 25),
      total: 25,
      completed: Math.floor(Math.random() * 12),
      pending: Math.floor(Math.random() * 13)
    }));
    setAttendanceData(mockAttendance);
  };

  const fetchQuizPerformance = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/getmyquizperformance/${UserId}`);
      if (response.data.success) {
        setQuizPerformance(response.data);
      } else {
        console.error('Failed to fetch quiz performance:', response.data.message);
        setQuizPerformance(null);
      }
    } catch (error) {
      console.error("Error fetching quiz performance:", error);
      setQuizPerformance(null);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return calendarEvents.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const handleEnroll = (name) => {
    setPrefillCourse(name);
    setShowModal(true);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!UserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access the dashboard</h3>
          <button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const monthDays = getMonthDays(currentMonth);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Calculate total completed and pending
  const totalCompleted = attendanceData.reduce((acc, curr) => acc + curr.completed, 0);
  const totalPending = attendanceData.reduce((acc, curr) => acc + curr.pending, 0);

  // Calculate performance data from quiz performance (SIMPLIFIED VERSION)
 // Calculate performance data from quiz performance (GRAPH VERSION)
const getPerformanceData = () => {
  if (!quizPerformance || !quizPerformance.quizzes || quizPerformance.quizzes.length === 0) {
    // Return default data if no quiz data
    return {
      recentQuizzes: [],
      averageScore: 0,
      averagePercentage: 0,
      totalAttempts: 0,
      quizzesByDate: [],
      totalScore: 0,
      totalPossiblePoints: 0,
      overallPercentage: 0
    };
  }

  const quizzes = quizPerformance.quizzes;
  
  // Sort by date (newest first)
  const sortedQuizzes = [...quizzes].sort((a, b) => 
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  // Get last 6 quizzes for graph (most recent)
  const recentQuizzes = sortedQuizzes.slice(0, 6);
  
  // Calculate average score based on your API data
  const totalScore = quizPerformance.summary?.totalScore || 0;
  const totalPossiblePoints = quizPerformance.summary?.totalPossiblePoints || 1;
  const averageScore = totalPossiblePoints > 0 ? (totalScore / totalPossiblePoints) * 10 : 0;
  const averagePercentage = quizPerformance.summary?.percentage ? parseFloat(quizPerformance.summary.percentage) : 0;
  
  // Group quizzes by date for chart
  const quizzesByDate = recentQuizzes.map((quiz, index) => {
    const date = new Date(quiz.submittedAt);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    // Calculate score out of 10 for graph display
    const quizScoreOutOf10 = quiz.totalPossiblePoints > 0 ? (quiz.score / quiz.totalPossiblePoints) * 10 : 0;
    
    return {
      label: `${month} ${day}`,
      score: quizScoreOutOf10,
      actualScore: quiz.score,
      totalPossiblePoints: quiz.totalPossiblePoints,
      percentage: quiz.percentage,
      quizTitle: quiz.quizTitle,
      date: quiz.submittedAt,
      hour: date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
    };
  });

  return {
    recentQuizzes: sortedQuizzes.slice(0, 3), // Last 3 quizzes for recent section
    averageScore,
    averagePercentage,
    totalAttempts: quizPerformance.summary?.totalQuizzesAttempted || quizzes.length,
    totalScore,
    totalPossiblePoints,
    overallPercentage: averagePercentage,
    quizzesByDate
  };
};

  const performanceData = getPerformanceData();

  // Performance graph calculations - now out of 10
// Performance graph calculations - now out of 10
const getBarHeight = (score, maxScore = 10) => {
  const height = (score / maxScore) * 100;
  return Math.min(Math.max(height, 0), 100); // Ensure between 0 and 100
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Welcome Header with Mentors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-white via-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 mr-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="text-blue-600 text-lg font-semibold mb-1">Welcome back! 👋</h4>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {userData?.name || "Student"}
                </h2>
                <p className="text-gray-600">
                  Continue your learning journey and achieve your goals
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mentors Section */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6">
          <div className="text-white h-full">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold mb-1 flex items-center text-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your Mentor
              </h5>
              {mentors.length > 1 && (
                <button 
                  onClick={() => {
                    const currentIndex = mentors.findIndex(m => m._id === selectedMentor?._id);
                    const nextIndex = (currentIndex + 1) % mentors.length;
                    setSelectedMentor(mentors[nextIndex]);
                  }}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
                >
                  Switch
                </button>
              )}
            </div>
            
            {selectedMentor ? (
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h6 className="font-bold text-lg">
                      {selectedMentor.firstName} {selectedMentor.lastName}
                    </h6>
                    <p className="text-blue-100 text-sm">
                      {selectedMentor.expertise || "Expert Mentor"}
                    </p>
                    <div className="flex items-center mt-2 space-x-3 text-xs">
                      <a href={`mailto:${selectedMentor.email}`} className="flex items-center text-blue-200 hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : mentors.length > 0 ? (
              mentors.map((mentor, index) => (
                <div key={mentor._id} className={`mb-3 ${index > 0 ? 'opacity-70' : ''}`}>
                  <div className="text-sm text-blue-100 mb-1">Mentor {index + 1}</div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h6 className="font-bold">
                          {mentor.firstName} {mentor.lastName}
                        </h6>
                        <p className="text-blue-100 text-xs">
                          {mentor.expertise || "Expert Mentor"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-blue-100 text-sm">No mentors assigned yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - 3 Columns Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Today's Classes Card */}
        <div className="group relative bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
          <div className="relative flex items-center">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Today's Classes</h6>
              <h3 className="text-3xl font-bold text-gray-900">{todaysClassesCount}</h3>
              <p className="text-gray-500 text-xs">Scheduled sessions</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {todaysClassesCount > 0 ? (
                <span className="text-green-600 font-medium">Classes scheduled</span>
              ) : (
                <span className="text-gray-500">No classes today</span>
              )}
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="group relative bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
          <div className="relative flex items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Completed</h6>
              <h3 className="text-3xl font-bold text-gray-900">{totalCompleted}</h3>
              <p className="text-gray-500 text-xs">Lessons finished</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Keep up the great work!</span>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="group relative bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:border-red-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-red-400/10 to-pink-500/10 rounded-full blur-lg group-hover:scale-110 transition-transform"></div>
          <div className="relative flex items-center">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-4 mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Pending</h6>
              <h3 className="text-3xl font-bold text-gray-900">{totalPending}</h3>
              <p className="text-gray-500 text-xs">Lessons remaining</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">You're making progress!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section - ADDED BACK */}
      <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-900 flex items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2 mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            My Enrolled Courses
          </h5>
          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold border border-green-200">
            {enrolledCourses.length} Courses
          </span>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <div key={course._id} className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h6 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-800 transition-colors">
                      {course.courseId?.name || "Course Name"}
                    </h6>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.courseId?.description || "Course description not available"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold ml-2 shadow-sm">
                    {course.courseId?.category || "Certified"}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Batch:</span>
                    <span className="font-semibold text-gray-900">{course.batchName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Batch Number:</span>
                    <span className="font-semibold text-gray-900">{course.batchNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="font-semibold text-gray-900">{course.courseId?.duration || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Mode:</span>
                    <span className="font-semibold text-gray-900">{course.courseId?.mode || "Online"}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md text-sm"
                    onClick={() => navigate("/course-content")}
                  >
                    Start Learning
                  </button>
                  <button
                    className="bg-white border border-green-500 text-green-600 hover:bg-green-50 px-3 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-sm flex items-center"
                    onClick={() => navigate("/live-classes")}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h5 className="text-gray-700 text-lg mb-2 font-semibold">No courses enrolled yet</h5>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start your learning journey by enrolling in a course today</p>
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex space-x-2">
            <button 
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-3 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              onClick={handlePrevMonth}
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-3 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              onClick={handleNextMonth}
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="text-center text-sm font-semibold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            
            return (
              <div 
                key={index} 
                className="min-h-28"
              >
                {date ? (
                  <div
                    className={`h-full flex flex-col cursor-pointer rounded-xl p-3 transition-all duration-300 border-2 ${
                      isToday(date) 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-105 border-transparent' 
                        : isSelected(date) 
                          ? 'bg-white border-blue-400 shadow-md' 
                          : 'bg-white/80 border-gray-100 hover:border-blue-200 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={`font-semibold text-sm ${
                      isToday(date) ? 'text-white' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="mt-2 space-y-1 flex-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div 
                          key={eventIndex}
                          className={`text-xs px-2 py-1 rounded-lg truncate ${
                            event.type === 'holiday' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          } ${isToday(date) ? 'bg-white/20 text-white border-white/30' : ''}`}
                        >
                          {event.name}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className={`text-xs text-center ${
                          isToday(date) ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-transparent border-2 border-gray-100 rounded-xl"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Events */}
        {getEventsForDate(selectedDate).length > 0 && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-3 mr-4 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              </div>
              <div>
                <h6 className="font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h6>
                <p className="text-gray-600 text-sm">
                  {selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getEventsForDate(selectedDate).map((event, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div 
                      className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                        event.type === 'holiday' ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    ></div>
                    <div>
                      <h6 className="font-semibold text-gray-900 mb-1">{event.name}</h6>
                      <p className="text-gray-600 text-sm">
                        {new Date(event.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {event.type && ` • ${event.type}`}
                      </p>
                      {event.description && (
                        <p className="text-gray-500 text-sm mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Classes Grid - Today's Classes and Previous Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Classes */}
        <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              Today's Classes
            </h5>
            <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-semibold border border-yellow-200">
              {todaysClassesCount} Scheduled
            </span>
          </div>

          {todaysClasses.length > 0 ? (
            <div className="space-y-4">
              {todaysClasses.map((classItem, idx) => (
                <div key={idx} className="group bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-xl p-5 border border-yellow-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h6 className="font-bold text-gray-900 text-lg group-hover:text-gray-800 transition-colors">
                        {classItem.topic || "Live Session"}
                      </h6>
                      <p className="text-gray-600 text-sm">
                        {classItem.instructor && `By ${classItem.instructor}`}
                      </p>
                    </div>
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
                      {formatTime(classItem.date)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {classItem.duration || "1h"}
                      </span>
                    </div>
                    <button
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                      onClick={() => navigate("/live-classes")}
                    >
                      Join Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-gray-700 text-lg mb-2 font-semibold">No classes today</h5>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Take this opportunity to review previous lessons or work on assignments</p>
              <button
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-sm"
                onClick={() => navigate("/live-classes")}
              >
                View All Classes
              </button>
            </div>
          )}
        </div>

        {/* Previous Classes */}
        <div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 a1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 a1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              Previous Classes
            </h5>
            <button 
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center group"
              onClick={() => navigate("/live-classes")}
            >
              View All
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {[...Array(2)].map((_, idx) => {
              const classItem = {
                id: idx + 1,
                topic: idx === 0 ? "Introduction to React Hooks" : "Advanced JavaScript Concepts",
                date: new Date(Date.now() - (idx + 1) * 86400000),
                duration: idx === 0 ? "1h 30m" : "2h",
                instructor: idx === 0 ? "John Doe" : "Jane Smith"
              };

              return (
                <div key={idx} className="group bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl p-5 border border-blue-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h6 className="font-bold text-gray-900 text-lg group-hover:text-gray-800 transition-colors">
                        {classItem.topic}
                      </h6>
                      <p className="text-gray-600 text-sm">
                        By {classItem.instructor}
                      </p>
                    </div>
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
                      {classItem.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {classItem.duration}
                      </span>
                    </div>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                      onClick={() => navigate("/live-classes")}
                    >
                      Watch Recording
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-sm w-full"
              onClick={() => navigate("/live-classes")}
            >
              View All Recordings
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Performance Table - SIMPLIFIED VERSION */}
<div className="bg-gradient-to-br from-white to-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
  <div className="flex justify-between items-center mb-8">
    <div>
      <h5 className="text-2xl font-bold text-gray-900 flex items-center">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2 mr-4">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        Your Quiz Performance
      </h5>
      <p className="text-gray-600 mt-2">Track your quiz scores and performance over time</p>
    </div>
    <div className="flex items-center space-x-6">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
        <span className="text-sm text-gray-700 font-medium">Your Score</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mr-2"></div>
        <span className="text-sm text-gray-700 font-medium">Class Average (7.5/10)</span>
      </div>
    </div>
  </div>

  <div className="relative">
    {/* Y-axis labels */}
    <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between text-sm text-gray-600 font-medium">
      <span>10</span>
      <span>7.5</span>
      <span>5</span>
      <span>2.5</span>
      <span>0</span>
    </div>

    {/* Graph container */}
    <div className="ml-14">
      <div className="h-72 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 2.5, 5, 7.5, 10].map((line, index) => (
            <div key={index} className="border-t border-gray-200"></div>
          ))}
        </div>

        {/* Horizontal grid lines for reference */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((_, index) => (
            <div key={`h-${index}`} className="border-t border-gray-100"></div>
          ))}
        </div>

        {/* Bars and Trend Lines */}
        {performanceData.quizzesByDate.length > 0 ? (
          <div className="h-full flex items-end justify-between px-6">
            {performanceData.quizzesByDate.map((data, index) => {
              const barHeight = getBarHeight(data.score);
              const avgBarHeight = getBarHeight(7.5);
              
              return (
                <div key={index} className="flex flex-col items-center w-10 relative">
                  {/* Trend line point for your score */}
                  <div 
                    className="absolute w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white shadow-lg"
                    style={{ 
                      bottom: `${barHeight}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}
                  ></div>
                  
                  {/* Trend line point for average score */}
                  <div 
                    className="absolute w-2 h-2 bg-gray-500 rounded-full border-2 border-white"
                    style={{ 
                      bottom: `${avgBarHeight}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}
                  ></div>
                  
                  {/* Your Score Bar */}
                  <div 
                    className="w-8 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-xl relative group cursor-pointer transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-20">
                      <div className="font-bold">{data.actualScore}/{data.totalPossiblePoints}</div>
                      <div className="text-xs text-gray-300">({data.percentage}%)</div>
                      <div className="text-xs text-gray-300">{data.quizTitle}</div>
                      <div className="text-xs text-gray-400">{data.label} {data.hour}</div>
                    </div>
                  </div>
                  
                  {/* Average Score Bar */}
                  <div 
                    className="w-4 bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-xl mt-2 relative group cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{ height: `${avgBarHeight}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                      <div className="font-bold">Avg: 7.5/10</div>
                      <div className="text-xs text-gray-300">Class Average</div>
                    </div>
                  </div>
                  
                  {/* Date label */}
                  <div className="text-sm text-gray-700 font-semibold mt-4">
                    {data.label}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <p className="text-lg">No quiz data available</p>
              <p className="text-sm mt-2">Complete quizzes to see your performance here</p>
            </div>
          </div>
        )}

        {/* SVG Trend lines */}
        {performanceData.quizzesByDate.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {/* Your Score Trend Line */}
            <path
              d={performanceData.quizzesByDate.map((data, index) => {
                const x = (index / (performanceData.quizzesByDate.length - 1)) * 100;
                const y = 100 - getBarHeight(data.score);
                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              stroke="url(#scoreGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Average Score Trend Line */}
            <path
              d={performanceData.quizzesByDate.map((_, index) => {
                const x = (index / (performanceData.quizzesByDate.length - 1)) * 100;
                const y = 100 - getBarHeight(7.5);
                return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              stroke="#9CA3AF"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4,3"
            />
            
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
    </div>
  </div>

  {/* Performance Summary */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 hover:border-green-300 hover:shadow-lg transition-all">
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-3 mr-4 shadow-md">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h6 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Overall Percentage</h6>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {performanceData.overallPercentage}%
          </p>
          <p className="text-green-600 text-sm font-medium mt-2">
            {performanceData.overallPercentage >= 90 ? 'Outstanding!' : 
             performanceData.overallPercentage >= 75 ? 'Excellent!' : 
             performanceData.overallPercentage >= 60 ? 'Good Work!' : 'Keep Practicing!'}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200 hover:border-cyan-300 hover:shadow-lg transition-all">
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 mr-4 shadow-md">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z" />
          </svg>
        </div>
        <div>
          <h6 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Total Attempts</h6>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {performanceData.totalAttempts}
          </p>
          <p className="text-blue-600 text-sm font-medium mt-2">
            Quizzes completed
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200 hover:border-pink-300 hover:shadow-lg transition-all">
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3 mr-4 shadow-md">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h6 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Total Score</h6>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {performanceData.totalScore}/{performanceData.totalPossiblePoints}
          </p>
          <p className="text-purple-600 text-sm font-medium mt-2">
            Perfect Score! 🎯
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
      {/* Modals */}
      <CourseEnquiryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        prefillCourse={prefillCourse}
      />
    </div>
  );
};

export default Dashboard;