import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);
  const idCardRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;

  // Fetch profile data
  useEffect(() => {
    if (userId) {
      fetchProfileData();
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.techsterker.com/api/myprofile/${userId}`);
      
      if (response.data.success) {
        const profile = response.data.profile;
        setProfileData(profile);
        
        // Set form data for editing
        setFormData({
          name: profile.name || '',
          firstName: profile.firstName || profile.name?.split(' ')[0] || '',
          lastName: profile.lastName || profile.name?.split(' ').slice(1).join(' ') || '',
          email: profile.email || '',
          mobile: profile.mobile || profile.phoneNumber || '',
          degree: profile.degree || '',
          department: profile.department || '',
          yearOfPassedOut: profile.yearOfPassedOut || '',
          company: profile.company || '',
          role: profile.role || '',
          experience: profile.experience || ''
        });

        // Load profile image from profile data
        if (profile.profileImage) {
          setProfileImage(profile.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImageFile(file);
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.email || !formData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName || '');
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.mobile);
      formDataToSend.append('degree', formData.degree || '');
      formDataToSend.append('department', formData.department || '');
      formDataToSend.append('yearOfPassedOut', formData.yearOfPassedOut || '');
      formDataToSend.append('company', formData.company || '');
      formDataToSend.append('role', formData.role || '');
      formDataToSend.append('experience', formData.experience || '');
      
      // Add image file if selected
      if (selectedImageFile) {
        formDataToSend.append('profileImage', selectedImageFile);
      }

      // Call the update API
      const response = await axios.put(
        `http://localhost:5001/api/userregister/${userId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        
        // Update local state with new data
        const updatedProfile = {
          ...profileData,
          ...response.data.data,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        };
        
        setProfileData(updatedProfile);
        
        // Update profile image if it was uploaded
        if (response.data.data.profileImage) {
          setProfileImage(response.data.data.profileImage);
        }
        
        // Clear selected image file
        setSelectedImageFile(null);
        
        // Update user in sessionStorage
        const updatedUser = {
          ...user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        
        // Refresh profile data to get latest from server
        fetchProfileData();
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update profile');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Download ID card as image
  const downloadIDCard = async () => {
    if (!idCardRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `TechsterKer-ID-Card-${profileData?.name || 'User'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('ID Card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ID card:', error);
      toast.error('Failed to download ID card');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Profile not found</h3>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            onClick={() => navigate('/dashboard')}
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your personal information</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Profile Overview Card - WITHOUT Profile Image */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-8 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{profileData.name}</h2>
                <p className="text-blue-100 text-lg mb-3 sm:mb-4">{profileData.course || "Student"}</p>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-2 sm:space-y-0 justify-center lg:justify-start">
                  <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                    <span className="text-xs sm:text-sm text-blue-100">User ID:</span>
                    <span className="text-white font-bold ml-1 sm:ml-2 text-sm sm:text-base">{profileData.userId}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                    <span className="text-xs sm:text-sm text-blue-100">Email:</span>
                    <span className="text-white ml-1 sm:ml-2 text-sm sm:text-base truncate max-w-xs">{profileData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setFormData({
                          name: profileData.name || '',
                          firstName: profileData.firstName || profileData.name?.split(' ')[0] || '',
                          lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || '',
                          email: profileData.email || '',
                          mobile: profileData.mobile || profileData.phoneNumber || '',
                          degree: profileData.degree || '',
                          department: profileData.department || '',
                          yearOfPassedOut: profileData.yearOfPassedOut || '',
                          company: profileData.company || '',
                          role: profileData.role || '',
                          experience: profileData.experience || ''
                        });
                        setSelectedImageFile(null);
                        setProfileImage(profileData.profileImage || null);
                      }
                      setIsEditing(!isEditing);
                    }}
                    className={`bg-gradient-to-r ${isEditing ? 'from-red-500 to-pink-500' : 'from-blue-500 to-purple-500'} text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg text-sm sm:text-base`}
                  >
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-4">
                        Profile Picture
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl sm:text-2xl font-bold text-gray-500">
                              {getInitials(formData.firstName + ' ' + formData.lastName)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base"
                          >
                            {selectedImageFile ? 'Change Image' : 'Upload New Image'}
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                          />
                          {selectedImageFile && (
                            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 mt-2 truncate">
                              Selected: {selectedImageFile.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Course
                        </label>
                        <input
                          type="text"
                          name="course"
                          value={profileData.course || ""}
                          readOnly
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedImageFile(null);
                          setProfileImage(profileData.profileImage || null);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base w-full sm:w-auto"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">Full Name</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.name}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">Email Address</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold break-all">{profileData.email}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">Mobile Number</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.mobile || profileData.phoneNumber || "Not specified"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">User ID</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.userId}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">Course</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.course || "Not enrolled"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                      <div className="text-gray-600 text-sm font-semibold mb-2">Department</div>
                      <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.department || "Not specified"}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Card Section - Below Profile Info */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your ID Card</h3>
                
                {/* ID Card Container - Compact Design */}
                <div ref={idCardRef} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden max-w-xs mx-auto shadow-xl">
                  {/* Top Section with Logo */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20 flex items-center justify-center">
                    <div className="text-center">
                      <img 
                        src="/logo/lightlogo.png" 
                        alt="TechsterKer Logo" 
                        className="h-6 w-auto mx-auto mb-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=TK&background=ffffff&color=8b5cf6&bold=true&size=64`;
                        }}
                      />
                      <div className="text-blue-100 text-xs">Student ID Card</div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-4">
                    {/* Profile Image and Name Section */}
                  {/* Profile Image and Name Section */}
<div className="flex items-start gap-3 mb-4">
  <div className="w-16 h-16 rounded-full border-2 border-blue-500 bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
    {profileImage ? (
      <img
        src={profileImage}
        alt={profileData.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${profileData.name}&background=8b5cf6&color=fff&size=128`;
        }}
      />
    ) : (
      <span className="text-base font-bold text-white">
        {getInitials(profileData.name)}
      </span>
    )}
  </div>
  <div className="flex-1 min-w-0">
    <h2 className="text-lg font-bold text-gray-800 leading-snug mb-1 min-h-[2.5rem] flex items-center">
      {profileData.name}
    </h2>
    <div className="text-blue-600 font-semibold text-sm truncate">{profileData.course || "Student"}</div>
  </div>
</div>

{/* Essential Information */}
<div className="space-y-3 mb-4">
  <div className="flex items-start">
    <div className="w-6 pt-0.5 flex-shrink-0">
      <svg className="w-3 h-3 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    </div>
    <div className="flex-1 ml-2 min-w-0">
      <div className="text-xs text-gray-500 mb-0.5">Email</div>
      <div className="text-gray-800 font-medium text-xs break-words leading-tight min-h-[2rem] flex items-center">
        {profileData.email}
      </div>
    </div>
  </div>
  
  <div className="flex items-center">
    <div className="w-6 flex-shrink-0">
      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    </div>
    <div className="flex-1 ml-2">
      <div className="text-xs text-gray-500 mb-0.5">Mobile</div>
      <div className="text-gray-800 font-medium text-xs">{profileData.mobile || profileData.phoneNumber || 'N/A'}</div>
    </div>
  </div>
  
  <div className="flex items-center">
    <div className="w-6 flex-shrink-0">
      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="flex-1 ml-2">
      <div className="text-xs text-gray-500 mb-0.5">User ID</div>
      <div className="text-gray-800 font-medium text-xs">{profileData.userId}</div>
    </div>
  </div>
</div>

                    {/* ID Card Number */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">ID Card Number</div>
                          <div className="text-gray-800 font-medium text-xs">{profileData.userId}</div>
                    </div>
                  </div>

                  {/* Bottom Border */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                </div>

                {/* Download Button - Below ID Card */}
                <div className="mt-6 max-w-xs mx-auto">
                  <button
                    onClick={downloadIDCard}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download ID Card
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div>
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-green-700 px-5 py-3.5 rounded-xl font-semibold border border-green-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </div>
                      Browse Courses
                    </div>
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 px-5 py-3.5 rounded-xl font-semibold border border-blue-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Go to Dashboard
                    </div>
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 text-purple-700 px-5 py-3.5 rounded-xl font-semibold border border-purple-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Change Photo
                    </div>
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      sessionStorage.removeItem('user');
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                    className="w-full bg-gradient-to-r from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 text-red-700 px-5 py-3.5 rounded-xl font-semibold border border-red-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Logout
                    </div>
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;