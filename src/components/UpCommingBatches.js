import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header/Header";
import Footer from "../Pages/Footer";
import CourseEnquiryModal from '../components/EnrollModal';

const UpCommingBatches = () => {
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesRes = await axios.get("https://api.techsterker.com/api/allenrollments");
        if (batchesRes.data.success && batchesRes.data.data.length > 0) {
          const batches = batchesRes.data.data.map((b) => ({
            id: b._id,
            courseName: b.courseId?.name || b.batchName,
            batchNumber: b.batchNumber,
            date: b.startDate,
            timing: b.timings,
            duration: b.duration,
            status: b.status,
          }));
          
          setAllBatches(batches);
          setFilteredBatches(batches.filter(batch => batch.status === "Upcoming"));
        }

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterClick = (status) => {
    setActiveFilter(status);
    let filtered = [];
    
    if (status === "Fast Track Course") {
      filtered = allBatches.filter(batch => batch.status === "Fast Track Course");
    } else {
      filtered = allBatches.filter(batch => batch.status === status);
    }
    
    setFilteredBatches(filtered);
  };

  const handleEnroll = () => {
    setShowEnquiryModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    const config = {
      Upcoming: { gradient: "bg-gradient-to-r from-blue-500 to-cyan-500", text: "Starting Soon" },
      Ongoing: { gradient: "bg-gradient-to-r from-green-500 to-emerald-500", text: "Live Now" },
      "Fast Track Course": { gradient: "bg-gradient-to-r from-orange-500 to-red-500", text: "Fast Track Course" }
    }[status] || { gradient: "bg-gradient-to-r from-blue-500 to-cyan-500", text: status };
    
    return (
      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-md ${config.gradient}`}>
        {config.text}
      </div>
    );
  };

  const getCourseGradient = (courseName) => {
    if (courseName?.includes("Cyber") || courseName?.includes("Security")) {
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    } else if (courseName?.includes("Full Stack") || courseName?.includes("Java")) {
      return "bg-gradient-to-r from-orange-500 to-red-500";
    } else if (courseName?.includes("UI/UX") || courseName?.includes("UI & UXX")) {
      return "bg-gradient-to-r from-indigo-500 to-blue-500";
    } else {
      return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-16 shadow-inner">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin shadow-lg"></div>
              <p className="mt-6 text-gray-600 font-medium">Loading courses...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-16 shadow-inner">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-40">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 max-w-md w-full text-center border border-red-100 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
                <p className="text-gray-600 mb-6 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Only 3 tabs: Upcoming, Ongoing, Fast Track Course
  const allStatuses = ["Upcoming", "Ongoing", "Fast Track Course"];

  return (
    <>
      <Header />
      
      {/* Hero Section with Shadow */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 pt-32 pb-16 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Course Batches</h1>
          <p className="text-red-100 text-lg drop-shadow-md">Browse available course schedules</p>
        </div>
      </div>

      {/* Main Content with Inner Shadow */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Filter Tabs with Shadows */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {allStatuses.map((status) => {
                const batchCount = allBatches.filter(b => b.status === status).length;
                const isActive = activeFilter === status;
                
                return (
                  <button
                    key={status}
                    onClick={() => handleFilterClick(status)}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-md"
                    }`}
                  >
                    {status}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs shadow-sm ${
                      isActive ? "bg-white/30" : "bg-gray-100"
                    }`}>
                      {batchCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course Cards with Enhanced Shadows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Top Gradient Bar with Shadow */}
                  <div className={`h-2 shadow-inner ${getCourseGradient(batch.courseName)}`}></div>
                  
                  <div className="p-6">
                    {/* Status Badge with Shadow */}
                    <div className="mb-5">
                      {getStatusBadge(batch.status)}
                    </div>
                    
                    {/* Course Name with Text Shadow */}
                    <h3 className="text-xl font-bold text-gray-900 mb-6 drop-shadow-sm">
                      {batch.courseName}
                    </h3>
                    
                    {/* Info Items with Card-like Shadows */}
                    <div className="space-y-5">
                      {/* Start Date Card */}
                      <div className="flex items-center bg-gradient-to-r from-blue-50 to-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Start Date</div>
                          <div className="font-semibold text-gray-900">{formatDate(batch.date)}</div>
                        </div>
                      </div>
                      
                      {/* Schedule Card */}
                      <div className="flex items-center bg-gradient-to-r from-green-50 to-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Schedule</div>
                          <div className="font-semibold text-gray-900">{batch.timing}</div>
                        </div>
                      </div>
                      
                      {/* Duration Card */}
                      <div className="flex items-center bg-gradient-to-r from-purple-50 to-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-semibold text-gray-900">{batch.duration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3">
                <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 shadow-2xl">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-gray-400 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 drop-shadow-sm">
                    {`No ${activeFilter} Courses Available`}
                  </h3>
                  
                  <p className="text-gray-600 mb-8">
                    New courses will be announced soon. Stay tuned for updates.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => window.location.href = "whatsapp://call?phone=919000239871"}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Contact for Updates
                    </button>
                    <button
                      onClick={() => handleFilterClick(activeFilter === "Upcoming" ? "Ongoing" : "Upcoming")}
                      className="px-6 py-2.5 bg-gradient-to-r from-white to-gray-50 text-red-600 font-medium rounded-lg border border-red-600 hover:bg-red-50 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Check {activeFilter === "Upcoming" ? "Live" : "Upcoming"} Courses
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons with Enhanced Shadows */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-100 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 drop-shadow-sm">
                  Ready to enroll?
                </h3>
                <p className="text-gray-600 text-sm">
                  Get started with your learning journey today
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEnroll}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Enroll Now
                </button>
                <button
                  onClick={() => window.location.href = "whatsapp://call?phone=919000239871"}
                  className="px-6 py-2.5 bg-gradient-to-r from-white to-gray-50 text-red-600 font-medium rounded-lg border border-red-600 hover:bg-red-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Details
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards with Shadows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-blue-100 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                {allBatches.filter(b => b.status === 'Upcoming').length}
              </div>
              <div className="text-sm text-gray-700 font-medium">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl border border-green-100 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                {allBatches.filter(b => b.status === 'Ongoing').length}
              </div>
              <div className="text-sm text-gray-700 font-medium">Live Now</div>
            </div>
            <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl border border-orange-100 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                {allBatches.filter(b => b.status === 'Fast Track Course').length}
              </div>
              <div className="text-sm text-gray-700 font-medium">Fast Track Course</div>
            </div>
          </div>

          {/* Final CTA with Enhanced Shadow */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-8 border border-red-200 shadow-2xl">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 drop-shadow-sm">
                Start Your Learning Journey
              </h3>
              <p className="text-gray-600 mb-6">
                Choose from our selection of courses and begin your educational journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleFilterClick("Upcoming")}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View Upcoming
                </button>
                <button
                  onClick={() => handleFilterClick("Ongoing")}
                  className="px-6 py-2.5 bg-gradient-to-r from-white to-gray-50 text-red-600 font-medium rounded-lg border border-red-600 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View Live Courses
                </button>
                <button
                  onClick={() => window.location.href = "whatsapp://call?phone=919000239871"}
                  className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Contact Advisor
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <CourseEnquiryModal
        show={showEnquiryModal}
        handleClose={() => setShowEnquiryModal(false)}
      />

      <Footer />
    </>
  );
};

export default UpCommingBatches;