// CourseEnquiryModal.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CourseEnquiryModal = ({ show, handleClose, prefillCourse = '' }) => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const courseInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courses: prefillCourse ? [prefillCourse] : [],
    city: '',
    message: ''
  });

  // Fetch all available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://api.techsterker.com/api/coursecontroller');
        const data = await response.json();
        setCourses(data.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Autofill if prefillCourse is provided
  useEffect(() => {
    if (prefillCourse) {
      setFormData(prev => ({ ...prev, courses: [prefillCourse] }));
      setSearchTerm('');
    }
  }, [prefillCourse]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        courseInputRef.current &&
        !courseInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleCourseSelect = (courseName) => {
    if (!formData.courses.includes(courseName)) {
      setFormData(prev => ({ ...prev, courses: [...prev.courses, courseName] }));
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleRemoveCourse = (courseName) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c !== courseName)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      courses: formData.courses.map(course => ({ name: course })), // ✅ correct field
      city: formData.city,
      message: formData.message
    };

    try {
      const response = await fetch('https://api.techsterker.com/api/Enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Your Enquiry Submitted Successfully',
          text: 'Our Team will get back to you soon!'
        });
        setFormData({ name: '', phone: '', email: '', courses: [], city: '', message: '' });
        setSearchTerm('');
        handleClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Please try again later.'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Check Your Network',
        text: 'Unable to submit enquiry. Try after sometime'
      });
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className="p-4 bg-light rounded">
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="text"
            name="name"
            placeholder="Your Name*"
            className="mb-3"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Form.Control
            type="tel"
            name="phone"
            placeholder="Your Phone Number*"
            className="mb-3"
            value={formData.phone}
            inputMode="numeric"
            pattern="[0-9]{10}"      // must be exactly 10 digits
            maxLength={10}
            required
            onChange={(e) => {
              // keep digits only and limit to 10
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone: digits });
            }}
          />
          <Form.Control
            type="email"
            name="email"
            placeholder="Your Email"
            className="mb-3"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Searchable Multi Course Input */}
          <div className="position-relative mb-3" ref={courseInputRef}>
            {/* Selected courses as badges */}
            <div className="mb-2 d-flex flex-wrap gap-2">
              {formData.courses.map((course, idx) => (
                <Badge
                  key={idx}
                  pill
                  bg="danger"
                  className="bg-meroon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveCourse(course)}
                >
                  {course} ✕
                </Badge>
              ))}
            </div>
            <Form.Control
              type="text"
              placeholder="Search & select courses*"
              value={searchTerm}
              onChange={handleCourseInputChange}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && filteredCourses.length > 0 && (
              <ListGroup
                ref={suggestionsRef}
                className="position-absolute w-100 shadow-sm"
                style={{
                  zIndex: 1000,
                  maxHeight: '150px',
                  overflowY: 'auto',
                  cursor: 'pointer'
                }}
              >
                {filteredCourses.map((course) => (
                  <ListGroup.Item
                    key={course._id}
                    action
                    onClick={() => handleCourseSelect(course.name)}
                  >
                    {course.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          <Form.Control
            type="text"
            name="city"
            placeholder="City Name"
            className="mb-3"
            value={formData.city}
            onChange={handleChange}
          />

          <Form.Control
            as="textarea"
            name="message"
            rows={3}
            placeholder="Your Message"
            className="mb-4"
            value={formData.message}
            onChange={handleChange}
          />

          <Button type="submit" className="px-4 w-100 bg-meroon border-0">
            Enroll Now
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CourseEnquiryModal;
