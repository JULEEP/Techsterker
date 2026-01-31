import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaTachometerAlt,
  FaQuestionCircle,
  FaVideo,
  FaBook,
  FaCertificate,
  FaBars,
  FaArrowLeft,
  FaArrowRight,
  FaSignOutAlt,
  FaUserCircle,
  FaReceipt,
  FaChartArea,
  FaCreditCard,
  FaChartLine,
  FaUser,
  FaComments
} from 'react-icons/fa';

const UserSidebar = ({ isCollapsed, onToggleCollapse, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    setActivePath(location.pathname);
    if (userId) {
      fetchProfileData();
    }
  }, [location, userId]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`https://api.techsterker.com/api/myprofile/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePixelMindClick = () => {
    window.open('https://pixelmindsolutions.com/', '_blank');
  };

  // Beautiful purple gradient
  const sidebarGradient = 'linear-gradient(145deg, #8a2be2 0%, #9370db 25%, #ba55d3 50%, #da70d6 75%, #dda0dd 100%)';

  const menuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/dashboard/myprofile', icon: <FaUser />, label: 'My Profile' },
    { path: '/dashboard/interviews', icon: <FaQuestionCircle />, label: 'Interviews' },
    { path: '/dashboard/live-classes', icon: <FaVideo />, label: 'Live Classes' },
    { path: '/dashboard/coursemodule', icon: <FaBook />, label: 'Course Module' },
    { path: '/dashboard/chat', icon: <FaComments />, label: 'Chat' },
    { path: '/dashboard/certificate', icon: <FaCertificate />, label: 'Certificate' },
    { path: '/dashboard/payment', icon: <FaCreditCard />, label: 'Payment Overview' },
    { path: '/dashboard/attendanceprogress', icon: <FaChartLine />, label: 'Attendance & Progress' },
    { path: '/', icon: <FaSignOutAlt />, label: 'Logout', onClick: handleLogout }
  ];

  // Get user initials
  const getUserInitials = () => {
    if (profileData?.name) {
      const names = profileData.name.split(' ');
      if (names.length > 1) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return profileData.name.charAt(0).toUpperCase();
    }
    return user?.name?.charAt(0)?.toUpperCase() || 'S';
  };

  // Get user name
  const getUserName = () => {
    if (profileData?.name) return profileData.name;
    if (user?.name) return user.name;
    return 'Student Name';
  };

  // Get user email
  const getUserEmail = () => {
    if (profileData?.email) return profileData.email;
    if (user?.email) return user.email;
    return 'student@example.com';
  };

  // Get user ID
  const getUserID = () => {
    if (profileData?.userId) return profileData.userId;
    if (user?.userId) return user.userId;
    return 'STUDENT001';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="position-fixed vh-100 vw-100"
          style={{ 
            backgroundColor: 'rgba(138, 43, 226, 0.3)', 
            zIndex: 1029, 
            left: 0, 
            top: 0 
          }}
          onClick={() => onToggleCollapse(true)}
        />
      )}

      {/* Sidebar with purple gradient */}
      <div
        className="position-fixed vh-100 d-flex flex-column"
        style={{
          width: isMobile ? (isCollapsed ? '0' : '250px') : isCollapsed ? '80px' : '250px',
          background: sidebarGradient,
          color: 'white',
          zIndex: 1030,
          transition: 'all 0.3s ease',
          overflowX: 'hidden',
          boxShadow: '0 0 25px rgba(138, 43, 226, 0.4)',
          borderRight: '2px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Collapse Button */}
        <div className="d-flex justify-content-end align-items-center p-3">
          <button
            className="btn btn-sm text-white rounded-circle"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s'
            }}
            onClick={() => onToggleCollapse(!isCollapsed)}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            {isCollapsed ? <FaArrowRight /> : <FaArrowLeft />}
          </button>
        </div>

        {/* Profile Section */}
        {!isCollapsed && (
          <div className="d-flex flex-column align-items-center text-center mt-2 mb-4 px-3">
            <div
              className="rounded-circle mb-3 position-relative"
              style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #fff 0%, #e6e6fa 100%)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                border: '3px solid white',
                overflow: 'hidden'
              }}
            >
              {profileData?.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <FaUserCircle className="text-purple" size={50} style={{ color: '#8a2be2' }} />
              )}
            </div>
            <p className="text-white fw-bold mb-1" style={{ fontSize: '1.1rem' }}>
              {loading ? 'Loading...' : getUserName()}
            </p>
            <p className="text-white-75 small mb-0" style={{ opacity: 0.9 }}>
              {loading ? 'Loading...' : getUserEmail()}
            </p>
            <div className="mt-2">
              <span className="badge bg-white text-purple px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                {loading ? 'Loading...' : getUserID()}
              </span>
            </div>
          </div>
        )}

        {/* Menu */}
        <ul className="nav flex-column px-3 mt-2">
          {menuItems.map((item) => {
            const isActive = activePath === item.path;
            
            return (
              <li key={item.label} className="nav-item mb-2">
                {item.onClick ? (
                  <div
                    className={`nav-link d-flex align-items-center text-white rounded-pill ${isActive ? 'active' : ''}`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      transition: 'all 0.3s ease',
                      padding: '14px 20px',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={item.onClick}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Hover effect */}
                    {hoveredItem === item.label && !isActive && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50px'
                      }} />
                    )}

                    <span className="position-relative z-1" style={{ 
                      fontSize: '1.2rem',
                      marginRight: isCollapsed ? '0' : '15px',
                      transition: 'transform 0.3s',
                      transform: hoveredItem === item.label ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="position-relative z-1" style={{ 
                        fontSize: '0.95rem',
                        fontWeight: isActive ? '600' : '400'
                      }}>
                        {item.label}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <span style={{
                        position: 'absolute',
                        right: '20px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#32CD32',
                        boxShadow: '0 0 10px #32CD32'
                      }} />
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-link d-flex align-items-center text-white rounded-pill ${isActive ? 'active' : ''}`}
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                      transition: 'all 0.3s ease',
                      padding: '14px 20px',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Hover effect */}
                    {hoveredItem === item.label && !isActive && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50px'
                      }} />
                    )}

                    <span className="position-relative z-1" style={{ 
                      fontSize: '1.2rem',
                      marginRight: isCollapsed ? '0' : '15px',
                      transition: 'transform 0.3s',
                      transform: hoveredItem === item.label ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="position-relative z-1" style={{ 
                        fontSize: '0.95rem',
                        fontWeight: isActive ? '600' : '400'
                      }}>
                        {item.label}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <span style={{
                        position: 'absolute',
                        right: '20px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#32CD32',
                        boxShadow: '0 0 10px #32CD32'
                      }} />
                    )}

                    {/* Collapsed tooltip */}
                    {isCollapsed && hoveredItem === item.label && (
                      <div className="position-absolute start-100 top-50 translate-middle-y ms-3 bg-dark text-white p-3 rounded shadow-lg"
                        style={{
                          opacity: 1,
                          transition: 'opacity 0.2s',
                          whiteSpace: 'nowrap',
                          zIndex: 1060,
                          pointerEvents: 'none',
                          background: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          minWidth: '140px',
                          textAlign: 'center'
                        }}>
                        {item.label}
                      </div>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Bottom Info Section */}
        <div className="mt-auto">
          {/* Powered by PIXELMINDSOLUTION */}
          {!isCollapsed ? (
            <div 
              className="p-3 text-center cursor-pointer"
              onClick={handlePixelMindClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              style={{
                transition: 'all 0.3s',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              <div className="mb-1" style={{ opacity: 0.8 }}>
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: 'white',
                  margin: '0 auto 8px',
                  borderRadius: '2px',
                  opacity: 0.6
                }} />
              </div>
              <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                Powered by
              </small>
              <div 
                className="text-white fw-bold mt-1"
                style={{ 
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s'
                }}
              >
                PIXELMINDSOLUTION
              </div>
            </div>
          ) : (
            <div 
              className="p-3 text-center cursor-pointer"
              onClick={handlePixelMindClick}
              title="Powered by PIXELMINDSOLUTION"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              style={{
                transition: 'all 0.3s',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: '35px',
                  height: '35px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>P</span>
              </div>
            </div>
          )}

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-3 text-center">
              <small style={{ opacity: 0.5, fontSize: '0.75rem' }}>
                © 2025 Techsterker Learning Platform
              </small>
            </div>
          )}
        </div>

        {/* Collapsed Mini Profile */}
        {isCollapsed && (
          <div className="mt-auto p-3 text-center">
            <div className="position-relative d-inline-block">
              <div
                className="rounded-circle"
                style={{
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #fff 0%, #e6e6fa 100%)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  border: '2px solid white',
                  margin: '0 auto',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onClick={() => navigate('/dashboard/myprofile')}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {profileData?.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt="Profile" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <FaUserCircle className="text-purple" size={25} style={{ color: '#8a2be2' }} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

UserSidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    userId: PropTypes.string
  })
};

export default UserSidebar;