import React, { useState, useEffect } from 'react';
import { Download, Award, Clock, CheckCircle, Calendar, Clock as ClockIcon, FileText, Eye, ExternalLink } from 'lucide-react';
import axios from 'axios';

const Certificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [viewImage, setViewImage] = useState(null);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user?.id;

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!userId) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`https://api.techsterker.com/api/certificate/user/${userId}`);
        
        if (response.data.success) {
          const certificatesData = response.data.data || [];
          setCertificates(certificatesData);
          
          // Agar certificates hain toh course details fetch karo
          if (certificatesData.length > 0) {
            await fetchCourseDetails(certificatesData);
          }
        } else {
          throw new Error(response.data.message || 'Unable to load certificate data');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch certificates');
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [userId]);

  // Fetch course details for each certificate
  const fetchCourseDetails = async (certificatesData) => {
    try {
      const courseIds = certificatesData
        .map(cert => cert.enrolledId?.courseId?._id)
        .filter(id => id);

      // Remove duplicates
      const uniqueCourseIds = [...new Set(courseIds)];

      const coursePromises = uniqueCourseIds.map(id =>
        axios.get(`https://api.techsterker.com/api/coursecontroller/${id}`)
      );

      const courseResponses = await Promise.allSettled(coursePromises);
      
      const courseMap = {};
      courseResponses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.data.success) {
          const courseId = uniqueCourseIds[index];
          courseMap[courseId] = response.value.data.data;
        }
      });

      // Update certificates with course data
      const updatedCertificates = certificatesData.map(cert => {
        const courseId = cert.enrolledId?.courseId?._id;
        return {
          ...cert,
          courseDetails: courseMap[courseId] || null
        };
      });

      setCertificates(updatedCertificates);
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };

  // Get certificate image URL with localhost
  const getCertificateImageUrl = (certificateFile) => {
    if (!certificateFile) return null;
    
    // Agar full URL hai toh wahi use karo
    if (certificateFile.startsWith('http')) {
      return certificateFile;
    }
    
    // Agar relative path hai toh localhost add karo
    if (certificateFile.startsWith('/')) {
      // Localhost port 5001 par image show karega
      return `http://localhost:5001${certificateFile}`;
    }
    
    // Agar sirat filename hai toh
    return `http://localhost:5001/uploads/certificates/${certificateFile}`;
  };

  // Download certificate file
  const downloadCertificate = async (certificate) => {
    if (!certificate?.certificateFile) {
      alert('Certificate file not available');
      return;
    }

    const certificateId = certificate._id;
    setDownloading(prev => ({ ...prev, [certificateId]: true }));

    try {
      const imageUrl = getCertificateImageUrl(certificate.certificateFile);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Generate filename
      const courseName = certificate.courseDetails?.name || 
                        certificate.enrolledId?.batchName || 
                        'Certificate';
      const sanitizedName = courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedName}_certificate_${certificateId.slice(-6)}.jpg`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: Try with backend URL
      try {
        let fallbackUrl = certificate.certificateFile;
        if (!fallbackUrl.startsWith('http')) {
          fallbackUrl = `https://api.techsterker.com${fallbackUrl}`;
        }
        
        const response = await fetch(fallbackUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate_${certificateId}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error('Fallback also failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback download error:', fallbackErr);
        alert('Unable to download certificate. Please try again later or contact support.');
      }
    } finally {
      setDownloading(prev => ({ ...prev, [certificateId]: false }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get course name
  const getCourseName = (certificate) => {
    if (certificate.courseDetails?.name) {
      return certificate.courseDetails.name;
    }
    if (certificate.enrolledId?.batchName) {
      return certificate.enrolledId.batchName;
    }
    if (certificate.enrolledId?.batchNumber) {
      return certificate.enrolledId.batchNumber;
    }
    return 'Unknown Course';
  };

  // Status badge with proper styling
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === 'approved') {
      return (
        <span className="badge bg-success bg-opacity-10 text-success d-inline-flex align-items-center px-3 py-2 rounded-pill">
          <CheckCircle size={16} className="me-1" />
          Approved
        </span>
      );
    } else if (statusLower === 'pending') {
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center px-3 py-2 rounded-pill">
          <Clock size={16} className="me-1" />
          Pending
        </span>
      );
    }
    
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary d-inline-flex align-items-center px-3 py-2 rounded-pill">
        <Award size={16} className="me-1" />
        {status || 'Unknown'}
      </span>
    );
  };

  // Image Modal Component
  const ImageModal = ({ imageUrl, onClose, courseName }) => {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">{courseName} - Certificate</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body p-0">
              <div className="d-flex justify-content-center align-items-center bg-black">
                <img 
                  src={imageUrl} 
                  alt="Certificate" 
                  className="img-fluid"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className="modal-footer bg-dark">
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-light me-2"
              >
                <ExternalLink size={16} className="me-2" />
                Open in New Tab
              </a>
              <button className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5 className="alert-heading">Error</h5>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h5 className="alert-heading">Session Expired</h5>
          <p>Please login again to view your certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 fw-bold text-dark mb-2">My Certificates</h1>
                <p className="text-muted mb-0">
                  View and download your course completion certificates
                </p>
              </div>
              <div className="d-flex align-items-center">
                <Award className="text-primary me-2" size={28} />
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm rounded-4 p-5">
              <div className="card-body py-5">
                <Award size={80} className="text-muted mb-4 opacity-50" />
                <h4 className="text-muted mb-3">No certificates yet</h4>
                <p className="text-muted mb-4">
                  Complete your enrolled courses to receive certificates
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/my-courses'}
                >
                  View My Courses
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {certificates.map((certificate) => {
              const courseName = getCourseName(certificate);
              const isDownloading = downloading[certificate._id];
              const hasCertificateFile = certificate.certificateFile;
              const status = certificate.status;
              const certificateImageUrl = hasCertificateFile ? getCertificateImageUrl(certificate.certificateFile) : null;

              return (
                <div key={certificate._id} className="col-lg-4 col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-shadow transition-all">
                    <div className="card-body p-4">
                      {/* Course Info */}
                      <div className="mb-4">
                        <h5 className="fw-bold text-dark mb-2">{courseName}</h5>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {certificate.enrolledId?.category && (
                            <span className="badge bg-info bg-opacity-10 text-info">
                              {certificate.enrolledId.category}
                            </span>
                          )}
                          {certificate.enrolledId?.duration && (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                              {certificate.enrolledId.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Certificate Image Preview */}
                      <div className="mb-4 text-center">
                        {hasCertificateFile && status?.toLowerCase() === 'approved' ? (
                          <div className="certificate-preview-container">
                            <div 
                              className="certificate-preview bg-light rounded-3 p-3 mb-3 cursor-pointer hover-effect"
                              onClick={() => setViewImage({ 
                                url: certificateImageUrl, 
                                name: courseName 
                              })}
                            >
                              <img 
                                src={certificateImageUrl} 
                                alt={`${courseName} Certificate`}
                                className="img-fluid rounded border shadow-sm"
                                style={{ 
                                  maxHeight: '200px', 
                                  width: 'auto',
                                  objectFit: 'contain' 
                                }}
                                onError={(e) => {
                                  // Agar image load nahi hoti toh fallback icon show karo
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="text-center p-4">
                                      <FileText size={48} class="text-primary opacity-75 mb-2" />
                                      <h6 class="fw-bold mb-1">Certificate of Completion</h6>
                                      <p class="small text-muted mb-0">${courseName}</p>
                                      <p class="small text-danger mt-2">Click to view certificate</p>
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                            <div className="small text-muted d-flex justify-content-center align-items-center">
                              <Eye size={14} className="me-1" />
                              Click image to view full size
                            </div>
                          </div>
                        ) : (
                          <div className="certificate-placeholder bg-light rounded-3 p-4 text-center">
                            <Award size={64} className="text-muted opacity-50 mb-3" />
                            <h6 className="text-muted mb-2">Certificate Preview</h6>
                            <p className="small text-muted mb-0">
                              {status === 'Approved' 
                                ? 'Certificate will be available soon' 
                                : 'Complete course to unlock certificate'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Certificate Details */}
                      <div className="mb-4">
                        <div className="row g-2">
                          <div className="col-6">
                            <div className="small text-muted">Issued Date</div>
                            <div className="fw-medium">
                              {formatDate(certificate.createdAt)}
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="small text-muted">Status</div>
                            <div>{getStatusBadge(status)}</div>
                          </div>
                          {certificate.enrolledId?.startDate && (
                            <div className="col-12">
                              <div className="d-flex align-items-center small text-muted">
                                <Calendar size={14} className="me-1" />
                                Course Start: {formatDate(certificate.enrolledId.startDate)}
                              </div>
                            </div>
                          )}
                          {certificate.enrolledId?.timings && (
                            <div className="col-12">
                              <div className="d-flex align-items-center small text-muted">
                                <ClockIcon size={14} className="me-1" />
                                Timings: {certificate.enrolledId.timings}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-grid gap-2">
                        {hasCertificateFile && status?.toLowerCase() === 'approved' ? (
                          <>
                            <button
                              className={`btn btn-primary d-flex align-items-center justify-content-center ${
                                isDownloading ? 'disabled' : ''
                              }`}
                              onClick={() => downloadCertificate(certificate)}
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download size={18} className="me-2" />
                                  Download Certificate
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                              onClick={() => setViewImage({ 
                                url: certificateImageUrl, 
                                name: courseName 
                              })}
                            >
                              <Eye size={18} className="me-2" />
                              View Certificate
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                            disabled
                          >
                            <Clock size={18} className="me-2" />
                            Certificate {status === 'Pending' ? 'Processing' : 'Not Available'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-4">
                      <div className="small text-muted d-flex justify-content-between">
                        <span>Certificate ID: {certificate._id.slice(-8)}</span>
                        <span>Updated: {formatDate(certificate.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Section */}
        {certificates.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 bg-light rounded-4 p-4">
                <div className="row text-center">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="h4 fw-bold text-primary mb-1">{certificates.length}</div>
                    <div className="text-muted">Total Certificates</div>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="h4 fw-bold text-success mb-1">
                      {certificates.filter(c => c.status?.toLowerCase() === 'approved').length}
                    </div>
                    <div className="text-muted">Approved</div>
                  </div>
                  <div className="col-md-4">
                    <div className="h4 fw-bold text-warning mb-1">
                      {certificates.filter(c => c.status?.toLowerCase() === 'pending').length}
                    </div>
                    <div className="text-muted">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {viewImage && (
        <ImageModal 
          imageUrl={viewImage.url}
          courseName={viewImage.name}
          onClose={() => setViewImage(null)}
        />
      )}


      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }
        .certificate-preview-container .certificate-preview {
          border: 2px solid #dee2e6;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          transition: all 0.2s ease;
        }
        .certificate-preview-container .certificate-preview:hover {
          border-color: #0d6efd;
          transform: scale(1.02);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .certificate-placeholder {
          border: 2px dashed #dee2e6;
        }
        .modal {
          z-index: 1050;
        }
      `}</style>
    </>
  );
};

export default Certificate;