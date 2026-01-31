import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AttendanceProgress = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    mongoUserId: '',
    customUserId: '',
    totalRecords: 0
  });
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Session storage se user ID get karo
  const Student = JSON.parse(sessionStorage.getItem('user') || '{}');
  const UserId = Student.id;

  useEffect(() => {
    if (UserId) {
      fetchAttendanceData();
    } else {
      setLoading(false);
    }
  }, [UserId]);

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/myattendance/${UserId}`);
      const data = response.data;
      
      if (data.success) {
        setUserInfo({
          mongoUserId: data.mongoUserId,
          customUserId: data.customUserId,
          totalRecords: data.totalRecords
        });
        
        const transformedData = transformAttendanceData(data.attendance || []);
        setAttendanceData(transformedData);
      } else {
        console.error("API returned success: false");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform API response to match component structure
  const transformAttendanceData = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [];
    }
    
    // Group by subject
    const groupedBySubject = attendanceRecords.reduce((acc, record) => {
      if (!acc[record.subject]) {
        acc[record.subject] = {
          subject: record.subject,
          records: [],
          presentCount: 0,
          totalCount: 0,
          allRecords: [] // Store all individual records
        };
      }
      
      acc[record.subject].records.push(record);
      acc[record.subject].allRecords.push({
        ...record,
        date: new Date(record.date).toLocaleDateString('en-IN'),
        time: record.timing,
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1)
      });
      acc[record.subject].totalCount++;
      
      if (record.status === 'present') {
        acc[record.subject].presentCount++;
      }
      
      return acc;
    }, {});
    
    return Object.values(groupedBySubject).map(subjectData => {
      const attendancePercentage = Math.round((subjectData.presentCount / subjectData.totalCount) * 100);
      const totalClasses = subjectData.totalCount;
      const attendedClasses = subjectData.presentCount;
      
      // Assuming each subject has 30 total sessions
      const estimatedTotalSessions = 30;
      
      return {
        course: subjectData.subject,
        attended: attendedClasses,
        total: totalClasses,
        completed: attendedClasses,
        pending: estimatedTotalSessions - attendedClasses,
        attendancePercentage: attendancePercentage,
        records: subjectData.records,
        allRecords: subjectData.allRecords,
        presentCount: subjectData.presentCount,
        absentCount: subjectData.totalCount - subjectData.presentCount
      };
    });
  };

  // Get unique subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = attendanceData.map(item => item.course);
    return [...new Set(subjects)];
  }, [attendanceData]);

  // Filter attendance data
  const filteredAttendanceData = useMemo(() => {
    if (attendanceData.length === 0) return [];

    return attendanceData.filter(item => {
      // Filter by subject
      if (filterSubject && item.course !== filterSubject) return false;
      
      // Filter by date range
      if (dateRange.start || dateRange.end) {
        const hasMatchingDate = item.records.some(record => {
          const recordDate = new Date(record.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;
          
          if (startDate && endDate) {
            return recordDate >= startDate && recordDate <= endDate;
          } else if (startDate) {
            return recordDate >= startDate;
          } else if (endDate) {
            return recordDate <= endDate;
          }
          return true;
        });
        
        if (!hasMatchingDate) return false;
      }
      
      return true;
    });
  }, [attendanceData, filterSubject, dateRange]);

  // Calculate filtered summary
  const filteredSummary = useMemo(() => {
    if (filteredAttendanceData.length === 0) return null;
    
    const totalSubjects = filteredAttendanceData.length;
    const totalClasses = filteredAttendanceData.reduce((sum, item) => sum + item.total, 0);
    const totalAttended = filteredAttendanceData.reduce((sum, item) => sum + item.attended, 0);
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    
    return {
      totalSubjects,
      totalClasses,
      totalAttended,
      overallPercentage
    };
  }, [filteredAttendanceData]);

  // Download CSV function
  const downloadCSV = () => {
    if (filteredAttendanceData.length === 0) {
      alert('No data to download');
      return;
    }

    // Prepare data for CSV
    const csvData = [];
    
    // Add header
    csvData.push(['Subject', 'Total Classes', 'Classes Attended', 'Attendance %', 'Present', 'Absent']);
    
    // Add rows for each subject
    filteredAttendanceData.forEach(item => {
      csvData.push([
        item.course,
        item.total,
        item.attended,
        `${item.attendancePercentage}%`,
        item.presentCount,
        item.absentCount
      ]);
    });
    
    // Add summary row
    if (filteredSummary) {
      csvData.push([]);
      csvData.push(['SUMMARY', '', '', '', '', '']);
      csvData.push([
        'Total Subjects',
        'Total Classes',
        'Total Attended',
        `Overall ${filteredSummary.overallPercentage}%`,
        filteredAttendanceData.reduce((sum, item) => sum + item.presentCount, 0),
        filteredAttendanceData.reduce((sum, item) => sum + item.absentCount, 0)
      ]);
    }

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `attendance_report_${userInfo.customUserId || UserId}_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  };

  // Download Excel function
  const downloadExcel = () => {
    if (filteredAttendanceData.length === 0) {
      alert('No data to download');
      return;
    }

    // Prepare data for Excel
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['ATTENDANCE REPORT'],
      ['Generated on:', new Date().toLocaleString()],
      ['Student ID:', userInfo.customUserId || UserId],
      ['Report Period:', `${dateRange.start || 'Start'} to ${dateRange.end || 'End'}`],
      [],
      ['SUMMARY'],
      ['Total Subjects', filteredSummary?.totalSubjects || 0],
      ['Total Classes', filteredSummary?.totalClasses || 0],
      ['Total Attended', filteredSummary?.totalAttended || 0],
      ['Overall Percentage', `${filteredSummary?.overallPercentage || 0}%`],
      [],
      ['DETAILED ATTENDANCE BY SUBJECT']
    ];
    
    // Add headers for detailed data
    summaryData.push(['Subject', 'Total Classes', 'Classes Attended', 'Attendance %', 'Present', 'Absent', 'Status']);
    
    // Add detailed data
    filteredAttendanceData.forEach(item => {
      const status = item.attendancePercentage >= 75 ? 'Good' : 
                    item.attendancePercentage >= 50 ? 'Average' : 'Needs Improvement';
      summaryData.push([
        item.course,
        item.total,
        item.attended,
        `${item.attendancePercentage}%`,
        item.presentCount,
        item.absentCount,
        status
      ]);
    });
    
    // Create summary worksheet
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Detailed records sheet
    const detailedData = [
      ['DETAILED ATTENDANCE RECORDS'],
      [],
      ['Date', 'Subject', 'Time', 'Status', 'Student Name', 'Enrollment ID']
    ];
    
    // Add all detailed records
    filteredAttendanceData.forEach(item => {
      item.allRecords.forEach(record => {
        detailedData.push([
          record.date,
          record.subject,
          record.time,
          record.status,
          record.studentName,
          record.enrollmentId
        ]);
      });
    });
    
    const ws_details = XLSX.utils.aoa_to_sheet(detailedData);
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws_summary, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws_details, 'Detailed Records');
    
    // Generate and download Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `attendance_report_${userInfo.customUserId || UserId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterSubject('');
    setFilterStatus('all');
    setDateRange({ start: '', end: '' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!UserId) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <h5 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Attendance & Progress
        </h5>
        <p className="text-center py-8 text-gray-500">Please log in to view attendance details</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
      {/* Header with download buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h5 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Attendance & Progress
        </h5>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {filteredAttendanceData.length > 0 && (
            <>
              <button 
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
              
              <button 
                onClick={downloadExcel}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h6 className="font-bold text-gray-900">Filters</h6>
            <button 
              onClick={resetFilters}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
            >
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filterSubject && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                Subject: {filterSubject}
                <button 
                  onClick={() => setFilterSubject('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateRange.start && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                From: {dateRange.start}
                <button 
                  onClick={() => setDateRange(prev => ({ ...prev, start: '' }))}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {dateRange.end && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                To: {dateRange.end}
                <button 
                  onClick={() => setDateRange(prev => ({ ...prev, end: '' }))}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* User Info Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center md:text-left">
            <div className="text-sm text-gray-600">Student ID</div>
            <div className="font-bold text-gray-900">{userInfo.customUserId || UserId}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Records</div>
            <div className="font-bold text-gray-900">{userInfo.totalRecords}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Filtered Subjects</div>
            <div className="font-bold text-gray-900">{filteredAttendanceData.length}</div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-sm text-gray-600">Overall Attendance</div>
            <div className={`font-bold ${
              filteredSummary?.overallPercentage >= 75 ? 'text-green-600' : 
              filteredSummary?.overallPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {filteredSummary ? `${filteredSummary.overallPercentage}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      {filteredAttendanceData.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {attendanceData.length === 0 ? 'No Attendance Records Found' : 'No Matching Records'}
          </h3>
          <p className="text-gray-500 mb-4">
            {attendanceData.length === 0 
              ? 'Your attendance data will appear here once records are available.' 
              : 'Try changing your filter criteria.'}
          </p>
          {attendanceData.length > 0 && (
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Filtered Summary Card */}
          {filteredSummary && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm opacity-90">Total Subjects</div>
                  <div className="text-2xl font-bold">{filteredSummary.totalSubjects}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Total Classes</div>
                  <div className="text-2xl font-bold">{filteredSummary.totalClasses}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Classes Attended</div>
                  <div className="text-2xl font-bold">{filteredSummary.totalAttended}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Overall Attendance</div>
                  <div className="text-2xl font-bold">{filteredSummary.overallPercentage}%</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Attendance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttendanceData.map((item, idx) => {
              const attendancePercentage = item.attendancePercentage;
              return (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h6 className="font-bold text-gray-900 text-lg">{item.course}</h6>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      attendancePercentage >= 75 ? 'bg-green-100 text-green-800' : 
                      attendancePercentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {attendancePercentage >= 75 ? 'Good' : 
                       attendancePercentage >= 50 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Attendance</span>
                      <span className={`font-bold ${
                        attendancePercentage >= 75 ? 'text-green-600' : 
                        attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {attendancePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          attendancePercentage >= 75 ? "bg-gradient-to-r from-green-500 to-emerald-600" : 
                          attendancePercentage >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : 
                          "bg-gradient-to-r from-red-500 to-pink-600"
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-1">
                      {item.attended} of {item.total} classes attended
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white text-center shadow-md hover:shadow-lg transition-shadow">
                      <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xs font-medium">Present</div>
                      <div className="font-bold text-lg">{item.presentCount}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-3 text-white text-center shadow-md hover:shadow-lg transition-shadow">
                      <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xs font-medium">Absent</div>
                      <div className="font-bold text-lg">{item.absentCount}</div>
                    </div>
                  </div>
                  
                  {/* Recent Attendance Records */}
                  {item.records && item.records.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-2">Recent Classes</div>
                      <div className="space-y-2">
                        {item.records.slice(0, 3).map((record, recordIdx) => (
                          <div key={recordIdx} className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'present' ? 'Present' : 'Absent'}
                            </span>
                            <span className="text-gray-600">
                              {record.date ? new Date(record.date).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceProgress;