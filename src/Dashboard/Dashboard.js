import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseEnquiryModal from '../components/EnrollModal';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todaysClassesCount, setTodaysClassesCount] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [prefillCourse, setPrefillCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [previousClasses, setPreviousClasses] = useState([]);
  const [mentors, setMentors] = useState([]);

  const Student = JSON.parse(sessionStorage.getItem('user') || '{}');
  const UserId = Student.id;
  const navigate = useNavigate();

  // Performance graph data
  const [performanceData, setPerformanceData] = useState([
    { month: 'Jan', score: 65, avg: 60 },
    { month: 'Feb', score: 78, avg: 65 },
    { month: 'Mar', score: 82, avg: 70 },
    { month: 'Apr', score: 75, avg: 68 },
    { month: 'May', score: 88, avg: 72 },
    { month: 'Jun', score: 92, avg: 75 },
    { month: 'Jul', score: 85, avg: 73 },
    { month: 'Aug', score: 90, avg: 76 },
    { month: 'Sep', score: 87, avg: 74 },
    { month: 'Oct', score: 94, avg: 78 },
    { month: 'Nov', score: 89, avg: 76 },
    { month: 'Dec', score: 96, avg: 80 }
  ]);

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
        fetchRegisteredCourses(),
        fetchEnrollments(),
        fetchUserDetails(),
        fetchTodaysClassesData(),
        fetchCalendarEvents(),
        fetchAttendanceData(),
        fetchPreviousClasses(),
        fetchMentors()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/userenrollments/${UserId}`);
      setEnrolledCourses(response.data.enrolledCourses || []);
      if (response.data.mentors) {
        setMentors(response.data.mentors);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrolledCourses([]);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/userenrollments/${UserId}`);
      if (response.data.mentors && response.data.mentors.length > 0) {
        setMentors(response.data.mentors);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      setMentors([]);
    }
  };

  const fetchRegisteredCourses = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/usercourse/${UserId}`);
      setRegisteredCourses(response.data.data.user || []);
    } catch (error) {
      console.error("Error fetching registered courses:", error);
      setRegisteredCourses([]);
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

  const fetchPreviousClasses = async () => {
    try {
      const mockPreviousClasses = [
        {
          id: 1,
          topic: "Introduction to React Hooks",
          date: new Date(Date.now() - 86400000),
          duration: "1h 30m",
          instructor: "John Doe"
        },
        {
          id: 2,
          topic: "Advanced JavaScript Concepts",
          date: new Date(Date.now() - 172800000),
          duration: "2h",
          instructor: "Jane Smith"
        }
      ];
      setPreviousClasses(mockPreviousClasses);
    } catch (error) {
      console.error("Error fetching previous classes:", error);
      setPreviousClasses([]);
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
    const mockAttendance = [
      { course: "Data Science", attended: 18, total: 25, completed: 12, pending: 13 },
      { course: "Web Development", attended: 15, total: 22, completed: 10, pending: 12 }
    ];
    setAttendanceData(mockAttendance);
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

  const calculateProgress = (startDate, duration) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const totalWeeks = parseInt(duration) || 12;
    const elapsedWeeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));

    if (elapsedWeeks <= 0) return 0;
    if (elapsedWeeks >= totalWeeks) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsedWeeks / totalWeeks) * 100)));
  };

  const getCourseStatus = (progress, startDate) => {
    if (!startDate) return "Not Started";
    const start = new Date(startDate);
    const now = new Date();
    if (now < start) return "Upcoming";
    if (progress >= 100) return "Completed";
    return "In Progress";
  };

  const getCourseDates = (startDate, duration) => {
    if (!startDate) return { start: "TBD", end: "TBD" };
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (parseInt(duration) || 84) * 7);
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString()
    };
  };

  const handleEnroll = (name) => {
    setPrefillCourse(name);
    setShowModal(true);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate payment percentage
  const calculatePaymentPercentage = () => {
    if (!userData || !userData.totalPrice || userData.totalPrice === 0) return 0;
    const paidAmount = userData.advancePayment || 0;
    return Math.round((paidAmount / userData.totalPrice) * 100);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get first mentor from the list
  const getPrimaryMentor = () => {
    if (mentors.length === 0) return null;
    return mentors[0];
  };

  // Performance graph calculations
  const maxScore = Math.max(...performanceData.map(d => d.score), ...performanceData.map(d => d.avg));
  const getBarHeight = (score) => (score / maxScore) * 100;

  const primaryMentor = getPrimaryMentor();

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
  const paymentPercentage = calculatePaymentPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 mr-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-blue-600 text-lg font-semibold mb-1">Welcome back!</h4>
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
        
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <div className="text-white p-6 h-full flex flex-col justify-center">
            <div className="flex items-center mb-3">
              <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h5 className="font-semibold mb-1">Your Ranking</h5>
                <h2 className="text-3xl font-bold">#12</h2>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Top 15% of students</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
       

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full p-3 mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Today's Classes</h6>
              <h3 className="text-2xl font-bold text-yellow-600">{todaysClassesCount}</h3>
              <p className="text-gray-500 text-xs">Scheduled sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full p-3 mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Completed</h6>
              <h3 className="text-2xl font-bold text-blue-600">
                {attendanceData.reduce((acc, curr) => acc + curr.completed, 0)}
              </h3>
              <p className="text-gray-500 text-xs">Lessons finished</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-full p-3 mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Pending</h6>
              <h3 className="text-2xl font-bold text-red-600">
                {attendanceData.reduce((acc, curr) => acc + curr.pending, 0)}
              </h3>
              <p className="text-gray-500 text-xs">Lessons remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Graph Section - REPLACED Enrolled Courses */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Your Performance
          </h5>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Your Score</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Class Average</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 font-medium">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Graph container */}
          <div className="ml-12">
            <div className="h-64 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 25, 50, 75, 100].map((line) => (
                  <div key={line} className="border-t border-gray-200"></div>
                ))}
              </div>

              {/* Bars */}
              <div className="h-full flex items-end justify-between px-4">
                {performanceData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center w-8">
                    {/* Your Score Bar */}
                    <div 
                      className="w-6 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg relative group cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{ height: `${getBarHeight(data.score)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {data.score}%
                      </div>
                    </div>
                    
                    {/* Class Average Bar */}
                    <div 
                      className="w-3 bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-lg mt-1 relative group cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{ height: `${getBarHeight(data.avg)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Avg: {data.avg}%
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className="text-xs text-gray-600 font-medium mt-2">
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend line - Your Score */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M ${performanceData.map((data, index) => {
                    const x = (index / (performanceData.length - 1)) * 100;
                    const y = 100 - getBarHeight(data.score);
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                  }).join(' ')}`}
                  stroke="url(#scoreGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Trend line - Class Average */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M ${performanceData.map((data, index) => {
                    const x = (index / (performanceData.length - 1)) * 100;
                    const y = 100 - getBarHeight(data.avg);
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                  }).join(' ')}`}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4,4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h6 className="font-semibold text-gray-900">Current Score</h6>
                <p className="text-2xl font-bold text-green-600">{performanceData[performanceData.length - 1].score}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z" />
                </svg>
              </div>
              <div>
                <h6 className="font-semibold text-gray-900">Improvement</h6>
                <p className="text-2xl font-bold text-blue-600">
                  +{performanceData[performanceData.length - 1].score - performanceData[0].score}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-full p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h6 className="font-semibold text-gray-900">Above Average</h6>
                <p className="text-2xl font-bold text-purple-600">
                  +{performanceData[performanceData.length - 1].score - performanceData[performanceData.length - 1].avg}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid - Today's Classes and Previous Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Classes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Today's Classes
            </h5>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {todaysClassesCount} Scheduled
            </span>
          </div>

          {todaysClasses.length > 0 ? (
            <div className="space-y-4">
              {todaysClasses.map((classItem, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-bold text-gray-900 text-lg">{classItem.topic || "Live Session"}</h6>
                      <p className="text-gray-600 text-sm">
                        {classItem.instructor && `By ${classItem.instructor}`}
                      </p>
                    </div>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {formatTime(classItem.date)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {classItem.duration || "1h"}
                      </span>
                    </div>
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                      onClick={() => navigate("/live-classes")}
                    >
                      Join Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h5 className="text-gray-600 text-lg mb-2">No classes today</h5>
              <p className="text-gray-500 mb-4">Enjoy your day off!</p>
            </div>
          )}
        </div>

        {/* Previous Classes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Previous Classes
            </h5>
            <button 
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              onClick={() => navigate("/live-classes")}
            >
              View All
            </button>
          </div>

          {previousClasses.length > 0 ? (
            <div className="space-y-4">
              {previousClasses.map((classItem, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-bold text-gray-900 text-lg">{classItem.topic}</h6>
                      <p className="text-gray-600 text-sm">
                        By {classItem.instructor}
                      </p>
                    </div>
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {classItem.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {classItem.duration}
                      </span>
                    </div>
                    <button
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                      onClick={() => navigate("/live-classes")}
                    >
                      Watch Recording
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <h5 className="text-gray-600 text-lg mb-2">No previous classes</h5>
              <p className="text-gray-500 mb-4">Your class history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment and Mentor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Section */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <h5 className="text-xl font-bold mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Payment Overview
          </h5>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Course Fee</span>
              <span className="font-bold text-lg">
                {userData?.totalPrice ? formatCurrency(userData.totalPrice) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Amount Paid</span>
              <span className="font-bold text-green-300 text-lg">
                {userData?.advancePayment ? formatCurrency(userData.advancePayment) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Amount</span>
              <span className="font-bold text-yellow-300 text-lg">
                {userData?.remainingPayment ? formatCurrency(userData.remainingPayment) : '₹0'}
              </span>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    paymentPercentage >= 50 ? 'bg-green-400' : 
                    paymentPercentage >= 25 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${paymentPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>{paymentPercentage}% Paid</span>
                <span>{100 - paymentPercentage}% Pending</span>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
              userData?.paymentStatus === 'Completed' ? 'bg-green-500/20 text-green-200' :
              userData?.paymentStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-200' :
              'bg-blue-500/20 text-blue-200'
            }`}>
              Status: {userData?.paymentStatus || 'Not Available'}
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 mt-2">
              Pay Now
            </button>
          </div>
        </div>

        {/* Mentor Section - REAL DATA */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h5 className="text-xl font-bold mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Assigned Mentor
            {mentors.length > 1 && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                +{mentors.length - 1} more
              </span>
            )}
          </h5>
          
          {primaryMentor ? (
            <>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h6 className="font-bold text-lg">
                    {primaryMentor.firstName} {primaryMentor.lastName}
                  </h6>
                  <p className="text-blue-100 text-sm">
                    {primaryMentor.expertise || "Expert Mentor"}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Available for guidance
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {primaryMentor.email}
                </div>
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {primaryMentor.phoneNumber}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-white/50 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <h5 className="text-white/80 text-lg mb-2">No mentor assigned yet</h5>
              <p className="text-white/60 mb-4">Your mentor will be assigned soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
        <h5 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Attendance & Progress
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendanceData.map((item, idx) => {
            const attendancePercentage = Math.round((item.attended / item.total) * 100);
            return (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300">
                <h6 className="font-bold text-gray-900 text-lg mb-4">{item.course}</h6>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Attendance</span>
                    <span>{attendancePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        attendancePercentage >= 75 ? "bg-green-500" : 
                        attendancePercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${attendancePercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">
                    {item.attended} of {item.total} classes attended
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white text-center shadow-md">
                    <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs">Completed</div>
                    <div className="font-bold">{item.completed}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-3 text-white text-center shadow-md">
                    <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs">Pending</div>
                    <div className="font-bold">{item.pending}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex space-x-2">
            <button 
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-2 rounded-xl transition-all transform hover:scale-105 shadow-md"
              onClick={handlePrevMonth}
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-2 rounded-xl transition-all transform hover:scale-105 shadow-md"
              onClick={handleNextMonth}
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            
            return (
              <div 
                key={index} 
                className="min-h-24 p-2 relative"
              >
                {date ? (
                  <div
                    className={`h-full flex flex-col cursor-pointer rounded-lg p-2 transition-all duration-300 border-2 ${
                      isToday(date) 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-105 border-transparent' 
                        : isSelected(date) 
                          ? 'bg-white border-blue-400 shadow-md' 
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={`font-semibold text-sm ${
                      isToday(date) ? 'text-white' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="mt-1 space-y-1 flex-1">
                      {dayEvents.slice(0, 2).map((event, eventIndex) => (
                        <div 
                          key={eventIndex}
                          className={`text-xs px-2 py-1 rounded-lg truncate ${
                            event.type === 'holiday' 
                              ? 'bg-red-500/20 text-red-700 border border-red-300' 
                              : 'bg-green-500/20 text-green-700 border border-green-300'
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
                  <div className="h-full bg-transparent border-2 border-gray-100 rounded-lg"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Events */}
        {getEventsForDate(selectedDate).length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-2 mr-3 shadow-lg">
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