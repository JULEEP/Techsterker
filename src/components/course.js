import React, { useState, useEffect } from 'react';
import { FaRegClock, FaCode, FaStar, FaUserGraduate, FaBook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseEnquiryModal from './EnrollModal';
import DownloadSyllabusModal from '../models/DownloadSyllabusModal';
import { FiDownload, FiEye } from 'react-icons/fi';

const Course = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showSyllabusModal, setShowSyllabusModal] = useState(false); // State for syllabus modal
    const [id, setId] = useState(null); // State to hold course ID for syllabus download

    const fetchCourses = async () => {
        try {
            const response = await axios.get('https://api.techsterker.com/api/coursecontroller');
            // Adjust based on actual API structure
            setCourses(response.data.data || response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleEnrollClick = (course) => {
        setSelectedCourse(course);
        setShowEnquiryModal(true);
    };

    const handleDownloadSyllabus = (id) => {
        setId(id);
        setShowSyllabusModal(true);
    };

    if (loading) {
        return (
            <section className="container py-5 flex justify-center items-center">
                <div className="spinner-border text-red-700" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gradient-to-br from-white via-gray-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold ">
                        Our <span className='textcolor'>Trending</span>  Courses
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Explore our wide range of courses designed for beginners and professionals.
                    </p>
                </div>

                {/* Courses Grid */}
                {Array.isArray(courses) && courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {courses.slice(0, 4).map(({ _id, name, image, category, duration, logoImage, mode, description, noOfLessons, noOfStudents }) => (
                            <div
                                key={_id}
                                className="bg-white/30 backdrop-blur-md rounded-xl shadow-lg p-6 flex flex-col justify-between border border-white/20 hover:shadow-2xl hover:bg-white/40 transition-all duration-300 transform hover:scale-105"
                            >
                                <div className="pb-4 border-b border-white/20 mb-2 d-flex gap-3">
                                    <img src={logoImage} className='img-fluid rounded-circle' style={{ height: "70px", width: "70px" }} />
                                    <div className=''>
                                        <h3 className="text-lg fw-bold text-gray-900">{name}</h3>
                                        <p className="text-sm font-semibold text-gray-500">{category}</p>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-800 mb-4">{description}</p>
                                </div>
                                <div className="flex items-center text-sm text-gray-700 mb-6 gap-6 flex-wrap">
                                    <div className="flex items-center">
                                        <FaRegClock className="mr-2 text-red-700" />
                                        <span>{duration}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaUserGraduate className="mr-2 text-red-700" />
                                        <span>{noOfStudents}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBook className="mr-2 text-red-700" />
                                        <span>{noOfLessons}</span>
                                    </div>

                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-center">

                                    <button
                                        className="py-2 px-3 rounded-md border border-red-300 font-medium hover:bg-gray-200 transition-colors btn-outline-meroon flex items-center justify-center gap-2"
                                        onClick={() => navigate(`/course/${_id}`)}
                                    >
                                        <FiEye size={18} />
                                        View Details
                                    </button>

                                    <button
                                        className="py-2 px-3 rounded-md border border-red-300 font-medium hover:bg-gray-200 transition-colors btn-outline-meroon flex items-center justify-center gap-2"
                                        onClick={() => handleDownloadSyllabus(_id)}
                                    >
                                        <FiDownload size={18} />
                                        Download Syllabus
                                    </button>

                                    <div className="sm:col-span-2 flex justify-center">
                                        <button
                                            className="w-50 sm:w-auto py-2 px-3 rounded-md text-white font-medium bg-red-700 hover:bg-red-800 transition-colors"
                                            onClick={() => handleEnrollClick({ title: name, _id })}
                                        >
                                            Enroll Now
                                        </button>
                                    </div>

                                </div>


                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-700">No courses available.</p>
                )}

                {/* View All Courses Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        className="py-3 px-6 bg-red-700 text-white rounded-md font-semibold hover:bg-red-800 transition-colors"
                        onClick={() => navigate('/courses')}
                    >
                        View All Courses
                    </button>
                </div>
            </div>
            <CourseEnquiryModal
                show={showEnquiryModal}
                handleClose={() => setShowEnquiryModal(false)}
                prefillCourse={selectedCourse?.title}
            />

            <DownloadSyllabusModal
                show={showSyllabusModal}
                courseId={id}
                handleClose={() => setShowSyllabusModal(false)}
            />
        </section>
    );
};

export default Course;
