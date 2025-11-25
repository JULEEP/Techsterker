import React, { useEffect, useState } from 'react';
import { MoveRight, Clock, Users, Calendar } from 'lucide-react';
import { MdOutlineTimer } from 'react-icons/md';
import { SiGoogleclassroom } from 'react-icons/si';
import { FaChevronLeft, FaChevronRight, FaVideo, FaUserTie } from 'react-icons/fa';

const LiveClassesPage = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    upcoming: 0,
    completed: 0
  });

  // Get user from session storage
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      if (!user || !user.id) {
        console.error('User not found in session storage');
        setLiveClasses([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`https://api.techsterker.com/api/live-classes/user/${user.id}`);
      const data = await res.json();

      console.log('Live classes data:', data);

      if (data.success) {
        const mappedClasses = data.data.map((cls) => {
          const mentor = cls.enrollmentIdRef?.assignedMentors?.[0] || {};
          const mentorName = mentor.firstName && mentor.lastName
            ? `${mentor.firstName} ${mentor.lastName}`
            : 'Unknown Mentor';

          const classDate = new Date(cls.date);
          const timingParts = cls.timing ? cls.timing.split(' - ') : [];
          const startTime = timingParts[0] || '00:00';

          const [time, modifier] = startTime.split(' ');
          let [hours, minutes] = time.split(':');

          if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
          } else if (modifier === 'AM' && hours === '12') {
            hours = '00';
          }

          const classDateTime = new Date(classDate);
          classDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

          return {
            _id: cls._id,
            title: cls.className,
            description: cls.subjectName,
            mentorName: mentorName,
            course: cls.enrollmentIdRef?.courseId?.name || 'General Course',
            timing: classDateTime.toISOString(),
            duration: cls.timing || '1 hour',
            meetLink: cls.link,
            rawDate: cls.date,
            rawTiming: cls.timing
          };
        });

        setLiveClasses(mappedClasses);
        calculateStats(mappedClasses);
      } else {
        console.error('Failed to fetch live classes:', data.message);
        setLiveClasses([]);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (classes) => {
    const now = new Date();
    const stats = {
      total: classes.length,
      live: 0,
      upcoming: 0,
      completed: 0
    };

    classes.forEach(cls => {
      const classTime = new Date(cls.timing);
      const endTime = new Date(classTime.getTime() + 60 * 60 * 1000);

      if (now >= classTime && now <= endTime) {
        stats.live++;
      } else if (now < classTime) {
        stats.upcoming++;
      } else {
        stats.completed++;
      }
    });

    setStats(stats);
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
    return liveClasses.filter(cls => 
      new Date(cls.timing).toDateString() === date.toDateString()
    );
  };

  const filteredClasses = getEventsForDate(selectedDate);

  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isClassLive = (classTime) => {
    const now = new Date();
    const classDate = new Date(classTime);
    const endTime = new Date(classDate.getTime() + 60 * 60 * 1000);
    return now >= classDate && now <= endTime;
  };

  const isClassUpcoming = (classTime) => {
    return new Date(classTime) > new Date();
  };

  const isClassEnded = (classTime) => {
    const now = new Date();
    const classDate = new Date(classTime);
    const endTime = new Date(classDate.getTime() + 60 * 60 * 1000);
    return now > endTime;
  };

  const monthDays = getMonthDays(currentMonth);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Classes</h1>
              <p className="text-gray-600">
                Join interactive live sessions and accelerate your learning journey
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Live Now</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Upcoming</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 mr-4 shadow-lg">
              <FaVideo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Total Classes</h6>
              <h3 className="text-2xl font-bold text-blue-600">{stats.total}</h3>
              <p className="text-gray-500 text-xs">All sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 mr-4 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Live Now</h6>
              <h3 className="text-2xl font-bold text-green-600">{stats.live}</h3>
              <p className="text-gray-500 text-xs">Active sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full p-3 mr-4 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Upcoming</h6>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.upcoming}</h3>
              <p className="text-gray-500 text-xs">Scheduled</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-full p-3 mr-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h6 className="text-gray-600 text-sm font-medium mb-1">Completed</h6>
              <h3 className="text-2xl font-bold text-gray-600">{stats.completed}</h3>
              <p className="text-gray-500 text-xs">Past sessions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-2xl font-bold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <div className="flex space-x-2">
              <button 
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-2 rounded-xl transition-all transform hover:scale-105 shadow-md"
                onClick={handlePrevMonth}
              >
                <FaChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-2 rounded-xl transition-all transform hover:scale-105 shadow-md"
                onClick={handleNextMonth}
              >
                <FaChevronRight className="w-4 h-4 text-gray-600" />
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
                              isClassLive(event.timing) 
                                ? 'bg-green-500/20 text-green-700 border border-green-300' 
                                : isClassUpcoming(event.timing)
                                  ? 'bg-blue-500/20 text-blue-700 border border-blue-300'
                                  : 'bg-gray-500/20 text-gray-700 border border-gray-300'
                            } ${isToday(date) ? 'bg-white/20 text-white border-white/30' : ''}`}
                          >
                            {event.title}
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
                  <Calendar className="w-5 h-5" />
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
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className={`w-3 h-3 rounded-full mt-1 mr-3 flex-shrink-0 ${
                        isClassLive(event.timing) ? 'bg-green-500' : 
                        isClassUpcoming(event.timing) ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <h6 className="font-semibold text-gray-900 mb-1">{event.title}</h6>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center">
                            <FaUserTie className="w-3 h-3 mr-1" />
                            {event.mentorName}
                          </span>
                          <span className="flex items-center">
                            <SiGoogleclassroom className="w-3 h-3 mr-1" />
                            {event.course}
                          </span>
                          <span className="flex items-center">
                            <MdOutlineTimer className="w-3 h-3 mr-1" />
                            {formatDateTime(event.timing)}
                          </span>
                        </div>
                        <a
                          href={event.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 shadow-md inline-flex items-center gap-2 ${
                            isClassLive(event.timing) 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                              : isClassUpcoming(event.timing)
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                          }`}
                          disabled={isClassEnded(event.timing)}
                        >
                          {isClassLive(event.timing) ? 'Join Live' : 
                           isClassUpcoming(event.timing) ? 'Join Soon' : 'Class Ended'}
                          <MoveRight size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Classes Sidebar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              Today's Classes
            </h5>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {getEventsForDate(new Date()).length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading classes...</p>
            </div>
          ) : getEventsForDate(new Date()).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h5 className="text-gray-600 text-lg mb-2">No classes today</h5>
              <p className="text-gray-500 text-sm">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {getEventsForDate(new Date()).map((cls) => (
                <div key={cls._id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-bold text-gray-900 text-sm mb-1">{cls.title}</h6>
                      <p className="text-gray-600 text-xs">{cls.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      isClassLive(cls.timing) ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {new Date(cls.timing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      <span className="flex items-center">
                        <FaUserTie className="w-3 h-3 mr-1" />
                        {cls.mentorName}
                      </span>
                    </div>
                    <a
                      href={cls.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 ${
                        isClassLive(cls.timing)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      }`}
                    >
                      {isClassLive(cls.timing) ? 'Join' : 'View'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Classes Grid */}
      <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            All Live Classes
          </h5>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {liveClasses.length} classes total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading all classes...</p>
          </div>
        ) : liveClasses.length === 0 ? (
          <div className="text-center py-8">
            <FaVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h5 className="text-gray-600 text-lg mb-2">No live classes available</h5>
            <p className="text-gray-500">Your live classes will appear here once scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((cls) => {
              const isLive = isClassLive(cls.timing);
              const isUpcoming = isClassUpcoming(cls.timing);

              return (
                <div key={cls._id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h6 className="font-bold text-gray-900 text-lg mb-1">{cls.title}</h6>
                      <p className="text-gray-600 text-sm mb-2">{cls.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isLive 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : isUpcoming
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {isLive ? 'Live' : isUpcoming ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserTie className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{cls.mentorName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <SiGoogleclassroom className="w-4 h-4 mr-2 text-purple-600" />
                      <span>{cls.course}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MdOutlineTimer className="w-4 h-4 mr-2 text-orange-600" />
                      <span>{formatDateTime(cls.timing)}</span>
                    </div>
                  </div>

                  <a
                    href={cls.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 ${
                      isLive
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        : isUpcoming
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={!isLive && !isUpcoming}
                  >
                    {isLive ? 'Join Live Class' : isUpcoming ? 'Join Soon' : 'Class Ended'}
                    <MoveRight size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

    
    </div>
  );
};

export default LiveClassesPage;