import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';

const UserLayout = ({ user, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        // Keep user preference on desktop, default to expanded
        const savedPreference = localStorage.getItem('sidebarCollapsed');
        if (savedPreference !== null) {
          setIsSidebarCollapsed(savedPreference === 'true');
        } else {
          setIsSidebarCollapsed(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar state preference
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
    }
  }, [isSidebarCollapsed, isMobile]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="d-flex bg-light" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobile={isMobile}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '250px'),
          transition: 'margin-left 0.3s ease',
          width: isMobile ? '100%' : `calc(100% - ${isSidebarCollapsed ? '80px' : '250px'})`,
          paddingTop: '70px' // Added padding for fixed navbar
        }}
      >
        {/* Top Navbar - Fixed to prevent hiding on scroll */}
        <nav
          className="navbar navbar-expand-lg navbar-dark fixed-top"
          style={{
            background: 'linear-gradient(145deg, #8a2be2 0%, #9370db 25%, #ba55d3 50%, #da70d6 75%, #dda0dd 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '0.75rem 1rem',
            height: '70px',
            zIndex: 1030 // Ensure it stays above other content
          }}
        >
          <div className="container-fluid">
            {isMobile && (
              <button
                className="btn btn-outline-light me-2"
                onClick={handleToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <i className="fas fa-bars"></i>
              </button>
            )}
            <div className="ms-auto text-white text-end">
              <img
                src="/logo/lightlogo.png"
                alt="HiCap Logo"
                className="max-h-8 md:max-h-10 lg:max-h-11 w-auto"
              />
            </div>
          </div>
        </nav>

        {/* Page Content - Adjusted top padding */}
        <div className="p-3 p-md-4" style={{ 
          minHeight: 'calc(100vh - 70px)', // Adjusted for navbar height
          background: '#f8f9fa'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;