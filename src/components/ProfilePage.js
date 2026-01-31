import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);
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
        `https://api.techsterker.com/api/userregister/${userId}`,
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
        // Server responded with error status
        toast.error(error.response.data.message || 'Failed to update profile');
      } else if (error.request) {
        // Request made but no response
        toast.error('Network error. Please check your connection.');
      } else {
        // Something else happened
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

  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.name,
      profileData.email,
      profileData.mobile || profileData.phoneNumber,
      profileData.degree,
      profileData.department,
      profileData.yearOfPassedOut,
      profileData.company,
      profileData.role,
      profileData.experience,
      profileImage
    ];
    
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
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

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your personal information and preferences</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-5 py-2.5 rounded-xl font-semibold border border-gray-200 shadow-sm transition-all hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl mb-6 md:mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0 w-full lg:w-auto">
                <div className="relative mb-4 sm:mb-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-2xl">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={profileData.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${profileData.name}&background=8a2be2&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {getInitials(profileData.name)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="ml-0 sm:ml-4 md:ml-8 text-center sm:text-left mt-4 sm:mt-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">{profileData.name}</h2>
                  <p className="text-blue-100 text-sm sm:text-base md:text-lg">{profileData.course || "Student"}</p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 mt-3 sm:mt-4">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl mb-2 sm:mb-0">
                      <span className="text-xs sm:text-sm text-blue-100">User ID:</span>
                      <span className="text-white font-bold ml-1 sm:ml-2 text-sm sm:text-base">{profileData.userId}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl">
                      <span className="text-xs sm:text-sm text-blue-100">Email:</span>
                      <span className="text-white ml-1 sm:ml-2 text-sm sm:text-base">{profileData.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 w-full lg:w-auto mt-6 lg:mt-0">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">{profileCompletion}%</div>
                  <div className="text-blue-100 text-sm sm:text-base mb-3 sm:mb-4">Profile Completion</div>
                  <div className="w-full sm:w-48 h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden mx-auto">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-blue-100 text-xs sm:text-sm mt-3 sm:mt-4">
                    {profileCompletion === 100 
                      ? "🎉 Perfect! Your profile is complete"
                      : `Complete ${100 - profileCompletion}% more to finish`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-2 mr-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Personal Information
                </h3>
                <button
                  onClick={() => {
                    if (isEditing) {
                      // Reset form data and image selection
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
                  className={`bg-gradient-to-r ${isEditing ? 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' : 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  {/* Image Upload Section */}
                  <div className="mb-6 md:mb-8">
                    <label className="block text-gray-700 text-sm font-semibold mb-3 sm:mb-4">
                      Profile Picture
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="relative flex justify-center sm:justify-start">
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
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md text-sm"
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
                            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 truncate">
                              Selected: {selectedImageFile.name}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-2 sm:mt-3">
                          Recommended: Square image, max 5MB. JPG, PNG formats.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        First Name <span className="text-red-500">*</span>
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
                        Email Address <span className="text-red-500">*</span>
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
                        Mobile Number <span className="text-red-500">*</span>
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
                        Degree
                      </label>
                      <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
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
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Year of Graduation
                      </label>
                      <input
                        type="number"
                        name="yearOfPassedOut"
                        value={formData.yearOfPassedOut}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                        min="1900"
                        max="2099"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Experience
                      </label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
                        placeholder="Describe your work experience..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
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
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white inline-block mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Full Name</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.name}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Email Address</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.email}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Mobile Number</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.mobile || profileData.phoneNumber || "Not specified"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">User ID</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.userId}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Degree</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.degree || "Not specified"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Department</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.department || "Not specified"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Year of Graduation</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.yearOfPassedOut || "Not specified"}</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Company</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.company || "Not specified"}</div>
                  </div>
                  <div className="sm:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="text-gray-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Experience</div>
                    <div className="text-gray-900 text-base sm:text-lg font-bold">{profileData.experience || "Not specified"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Information Card */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2 mr-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                Course Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 border border-blue-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 sm:p-3 mr-3 sm:mr-4">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs sm:text-sm font-semibold">Enrolled Course</div>
                      <div className="text-gray-900 text-lg sm:text-xl font-bold">{profileData.course || "Not enrolled"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-5 border border-purple-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2 sm:p-3 mr-3 sm:mr-4">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs sm:text-sm font-semibold">Payment Status</div>
                      <div className={`text-lg sm:text-xl font-bold ${profileData.paymentStatus === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {profileData.paymentStatus || "Pending"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-5 border border-green-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2 sm:p-3 mr-3 sm:mr-4">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs sm:text-sm font-semibold">Total Price</div>
                      <div className="text-gray-900 text-lg sm:text-xl font-bold">
                        ₹{profileData.totalPrice ? profileData.totalPrice.toLocaleString() : "0"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-5 border border-yellow-200">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-2 sm:p-3 mr-3 sm:mr-4">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs sm:text-sm font-semibold">Remaining Payment</div>
                      <div className="text-gray-900 text-lg sm:text-xl font-bold">
                        ₹{profileData.remainingPayment ? profileData.remainingPayment.toLocaleString() : "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <div className="text-gray-600 text-xs sm:text-sm">Account Created</div>
                    <div className="text-gray-900 font-semibold text-sm sm:text-base">
                      {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-gray-600 text-xs sm:text-sm">Last Updated</div>
                    <div className="text-gray-900 font-semibold text-sm sm:text-base">
                      {new Date(profileData.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div>
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Profile Stats</h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <span className="text-gray-600 font-semibold text-xs sm:text-sm">Enrolled Courses</span>
                    <span className="text-blue-600 font-bold text-sm sm:text-base">{profileData.enrolledCourses?.length || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${Math.min(100, (profileData.enrolledCourses?.length || 0) * 50)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <span className="text-gray-600 font-semibold text-xs sm:text-sm">Certificates</span>
                    <span className="text-green-600 font-bold text-sm sm:text-base">{profileData.certificates?.length || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${Math.min(100, (profileData.certificates?.length || 0) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <span className="text-gray-600 font-semibold text-xs sm:text-sm">Interviews</span>
                    <span className="text-yellow-600 font-bold text-sm sm:text-base">{profileData.interviews?.length || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${Math.min(100, (profileData.interviews?.length || 0) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Account Verified</div>
                  <div className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm ${profileData.verifyStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {profileData.verifyStatus ? (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified Account
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        Pending Verification
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl font-semibold border border-blue-200 transition-all flex items-center justify-between group text-sm sm:text-base"
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-1.5 sm:p-2 mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    Browse Courses
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-green-700 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl font-semibold border border-green-200 transition-all flex items-center justify-between group text-sm sm:text-base"
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-1.5 sm:p-2 mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Go to Dashboard
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {!isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 text-purple-700 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl font-semibold border border-purple-200 transition-all flex items-center justify-between group text-sm sm:text-base"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-1.5 sm:p-2 mr-2 sm:mr-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Change Photo
                    </div>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={() => {
                    sessionStorage.removeItem('user');
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                  className="w-full bg-gradient-to-r from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 text-red-700 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl font-semibold border border-red-200 transition-all flex items-center justify-between group text-sm sm:text-base"
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-1.5 sm:p-2 mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Logout
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-4 sm:p-6 mt-6">
              <div className="text-white">
                <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Need Help?
                </h4>
                <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">Our support team is here to help you 24/7</p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-white text-sm sm:text-base">support@techsterker.com</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-white text-sm sm:text-base">+91 9090909090</span>
                  </div>
                </div>
                <button className="w-full mt-4 sm:mt-6 bg-white text-blue-600 hover:bg-blue-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 text-sm sm:text-base">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;