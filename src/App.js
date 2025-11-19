import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ContactUs from "./Pages/ContactUs";
import AboutSection from "./Pages/AboutSection";
import FAQ from "./Pages/FAQ";
import BlogPage from "./Pages/BlogPage";
import OurMentorsPage from "./Pages/OurMentorsPage";
import Courses from "./Pages/Courses";
import CourseDetail from "./Pages/CourseDetail";
import DoubtSession from "./Pages/DoubtSession";
import Certificate from "./Pages/Certificate";
import Interviews from "./Pages/Interviews";
import Clients from "./Pages/Clients";
import UpCommingBatches from "./components/UpCommingBatches";
import Dashboard from "./Dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import LiveClasses from "./components/LiveClassesPage";
import CourseModule from "./admin/CourseModule";
import StickyContactButtons from "./models/StickyContactHoverClick";
import ResumeBuilding from "./services/ResumeBuild";
import MockInterviews from "./services/MockInterviews";
import PlacementAssistance from "./services/PlacementsAssistance";
import OnetoOneSession from "./services/OnetoOneAssistance";
import ProjectAssistance from "./services/Project Assistance";
import RealTimeAssistance from "./services/RealTimeAssistance";
import CoursesByCategory from "./newone/CoursesbyCategory";
import UserLayout from "./Header/UserLayout"; // User sidebar layout
import Events from "./newone/Events";
import EventDetails from "./newone/EventDetails";
import CourseAdminPanel from "./admin/AdminCourses";
import PaymentForm from "./Header/Payment";
import Acknowledge from "./admin/Acknowledgment";
import Careers from "./newone/Career";
import OurPolicies from "./Header/OurPolicies";
import CookieAcceptance from "./OurDocuments/CookiesAcceptance";
import PrivacyAndPolicies from "./Ourpolicies/PrivacyAndPolicy";
import CookiePolicies from "./Ourpolicies/CookiePolicy";
import Terms from "./Ourpolicies/TermsAndConditions";
import RefundPolicies from "./Ourpolicies/RefundPolicy";
import BrowseCourses from "./Dashboard/BrowseCourses";
import DashboardCourseDetail from "./Dashboard/DashboardCourseDetails";
import ChatModule from "./ChatModule/ChatModule";
import ChatSlack from "./ChatModule/ChatModule";
import Chat from "./ChatModule/ChatModule";
import StudentChats from "./ChatModule/ChatModule";
import BlogDetails from "./Pages/BlogDetails";
import ScrollToTop from "./newone/ScrollToTop";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = sessionStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setIsAuthenticated(!!user?.token);
          setUser(user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]);

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

//   const [loading, setLoading] = useState(false);

// useEffect(() => {
//   // Show splash every time route changes
//   setLoading(true);
//   const timer = setTimeout(() => {
//     setLoading(false);
//   }, 1000); // 1 sec

//   return () => clearTimeout(timer);
// }, [location]); // 👈 re-run when route changes


//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-white ">
//         {/* Logo */}
//         <img
//           src="/logo/hicaplogo.png"
//           alt="App Logo"
//           className="w-24 h-24 animate-bounce mb-4"
//         />

//         {/* App/Website Name */}
//         <h1 className="text-3xl font-bold text-gray-800">Techsterker</h1>

//         {/* Tagline */}
//         {/* <p className="mt-2 text-gray-500 animate-pulse">
//           Start Your career with Us.
//         </p> */}
//       </div>
//     );
//   }

  return (
    <>
    <ScrollToTop/>
      <CookieAcceptance />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />
        } />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/aboutus" element={<AboutSection />} />
        <Route path="/upcommingbatches" element={<UpCommingBatches />} />
        <Route path="/faqs" element={<FAQ />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/ourmentors" element={<OurMentorsPage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/resumebuilding" element={<ResumeBuilding />} />
        <Route path="/mockinterviews" element={<MockInterviews />} />
        <Route path="/projectassistance" element={<ProjectAssistance />} />
        <Route path="/realtimeassistance" element={<RealTimeAssistance />} />
        <Route path="/placements" element={<PlacementAssistance />} />
        <Route path="/onetoone" element={<OnetoOneSession />} />
        <Route path="/allcourses" element={<CoursesByCategory />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:title" element={<EventDetails />} />
        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/ourpolicies" element={<OurPolicies />} />
        <Route path="/privacypolicy" element={ <PrivacyAndPolicies/>}/>
        <Route path="/cookiepolicy" element={ <CookiePolicies/>}/>
        <Route path="/termsofuse" element={ <Terms/>}/>
        <Route path="/refundpolicy" element={ <RefundPolicies/>}/>

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <UserLayout user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />                {/* /dashboard */}
          <Route path="interviews" element={<Interviews />} />  {/* /dashboard/interviews */}
          <Route path="live-classes" element={<LiveClasses />} />
          <Route path="coursemodule" element={<CourseModule />} />
          <Route path="doubt-session" element={<DoubtSession />} />
          <Route path="certificate" element={<Certificate />} />
          <Route path="acknowledge" element={<Acknowledge />} />
          <Route path="browsecourses" element={<BrowseCourses />} />
          <Route path="course/:slug" element={<DashboardCourseDetail />} />
          <Route path="chat" element={<StudentChats />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Sticky contact button for non-authenticated users */}
      {!isAuthenticated && !['/contactus', '/aboutus', '/faqs'].includes(location.pathname) && (
        <StickyContactButtons />
      )}
    </>
  );
}

export default App;
