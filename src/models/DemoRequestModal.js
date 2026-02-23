// DemoRequestModal.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';

const DemoRequestModal = ({ show, handleClose }) => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const courseInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    message: ''
  });

  // Fetch courses from course controller
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://api.techsterker.com/api/coursecontroller');
        const data = await response.json();
        if (data.data) setCourses(data.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

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
    setFormData(prev => ({ ...prev, course: e.target.value }));
    setShowSuggestions(true);
  };

  const handleCourseSelect = (courseName) => {
    setFormData(prev => ({ ...prev, course: courseName }));
    setSearchTerm(courseName);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      course: formData.course,
      message: formData.message
    };

    try {
      const response = await fetch('https://api.techsterker.com/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: `Your Demo Request for ${formData.course} has Submitted succesfully`,
          text: 'You will receive a mail soon regarding demo session.'
        });
        setFormData({ name: '', phone: '', email: '', course: '', message: '' });
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
        title: 'Network Error',
        text: 'Unable to submit demo request.'
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
            inputMode="numeric"            // mobile numeric keyboard
            pattern="[0-9]{10}"            // HTML validation → exactly 10 digits
            maxLength={10}
            required
            onChange={(e) => {
              // allow numbers only
              const value = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, phone: value });
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

          {/* Searchable Course Input */}
          <div className="position-relative mb-3" ref={courseInputRef}>
            <Form.Control
              type="text"
              placeholder="Search or Select Course*"
              value={searchTerm}
              onChange={handleCourseInputChange}
              onFocus={() => setShowSuggestions(true)}
              required
            />
            {showSuggestions && filteredCourses.length > 0 && (
              <ListGroup
                ref={suggestionsRef}
                className="position-absolute w-100 shadow-sm"
                style={{ zIndex: 1000, maxHeight: '150px', overflowY: 'auto', cursor: 'pointer' }}
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
            as="textarea"
            name="message"
            rows={3}
            placeholder="Your Message"
            className="mb-4"
            value={formData.message}
            onChange={handleChange}
          />

          <Button type="submit" className="px-4 w-100 bg-meroon border-0">
            Request Demo
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DemoRequestModal;
