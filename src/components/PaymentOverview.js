import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const PaymentOverview = () => {
  const [userData, setUserData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  
  const Student = JSON.parse(sessionStorage.getItem('user') || '{}');
  const UserId = Student.id;

  useEffect(() => {
    if (UserId) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [UserId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`https://api.techsterker.com/api/userregister/${UserId}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    if (!UserId) return;
    
    if (invoices.length > 0) {
      setShowInvoices(!showInvoices);
      return;
    }

    setInvoiceLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/userinvoice/${UserId}`);
      if (response.data.success) {
        setInvoices(response.data.data || []);
        setShowInvoices(true);
      } else {
        throw new Error(response.data.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const calculatePaymentPercentage = () => {
    if (!userData || !userData.totalPrice || userData.totalPrice === 0) return 0;
    const paidAmount = userData.advancePayment || 0;
    return Math.round((paidAmount / userData.totalPrice) * 100);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getInvoiceStatus = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return {
          text: 'Paid',
          className: 'bg-green-500/20 text-green-300 border-green-500/30',
          icon: CheckCircle,
          iconColor: 'text-green-400'
        };
      case 'pending':
        return {
          text: 'Pending',
          className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: Clock,
          iconColor: 'text-yellow-400'
        };
      case 'overdue':
        return {
          text: 'Overdue',
          className: 'bg-red-500/20 text-red-300 border-red-500/30',
          icon: AlertCircle,
          iconColor: 'text-red-400'
        };
      default:
        return {
          text: status || 'Unknown',
          className: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: FileText,
          iconColor: 'text-gray-400'
        };
    }
  };

  const downloadInvoice = async (invoice) => {
    if (!invoice?.pdfUrl) {
      alert('Invoice PDF not available');
      return;
    }

    setDownloadingInvoice(invoice.invoiceId);
    try {
      // Construct the full URL from relative path
      let pdfUrl = invoice.pdfUrl;
      if (!pdfUrl.startsWith('http')) {
        pdfUrl = `https://api.techsterker.com${pdfUrl}`;
      }

      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber || invoice.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const viewInvoice = (invoice) => {
    if (!invoice?.pdfUrl) {
      alert('Invoice PDF not available');
      return;
    }

    let pdfUrl = invoice.pdfUrl;
    if (!pdfUrl.startsWith('http')) {
      pdfUrl = `https://api.techsterker.com${pdfUrl}`;
    }
    
    window.open(pdfUrl, '_blank');
  };

  const calculateGST = (totalAmount, subtotal) => {
    if (!totalAmount || !subtotal || subtotal === 0) return 0;
    return totalAmount - subtotal;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!UserId) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <h5 className="text-xl font-bold mb-6">Payment Overview</h5>
        <p className="text-center py-4 text-white/80">Please log in to view payment details</p>
      </div>
    );
  }

  const paymentPercentage = calculatePaymentPercentage();

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
      <h5 className="text-xl font-bold mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
        Payment Overview
      </h5>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Total Course Fee</span>
          <span className="font-bold text-lg">
            {userData?.totalPrice ? formatCurrency(userData.totalPrice) : '₹0'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Amount Paid</span>
          <span className="font-bold text-green-300 text-lg">
            {userData?.advancePayment ? formatCurrency(userData.advancePayment) : '₹0'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Pending Amount</span>
          <span className="font-bold text-yellow-300 text-lg">
            {userData?.remainingPayment ? formatCurrency(userData.remainingPayment) : '₹0'}
          </span>
        </div>
        <div className="pt-4 border-t border-white/20">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                paymentPercentage >= 50 ? 'bg-green-400' : 
                paymentPercentage >= 25 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${paymentPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>{paymentPercentage}% Paid</span>
            <span>{100 - paymentPercentage}% Pending</span>
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${
          userData?.paymentStatus === 'Completed' ? 'bg-green-500/20 text-green-200' :
          userData?.paymentStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-200' :
          'bg-blue-500/20 text-blue-200'
        }`}>
          Status: {userData?.paymentStatus || 'Not Available'}
        </div>

        {/* Invoices Section */}
        <div className="pt-4">
          <button 
            onClick={fetchInvoices}
            disabled={invoiceLoading}
            className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
          >
            {invoiceLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Invoices...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                {showInvoices ? 'Hide Invoices' : `View Invoices (${invoices.length})`}
              </>
            )}
          </button>

          {showInvoices && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h6 className="font-bold flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Your Invoices
                </h6>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {invoices.length} Invoice{invoices.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-white/80">No invoices found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {invoices.map((invoice) => {
                    const statusInfo = getInvoiceStatus(invoice.status);
                    const StatusIcon = statusInfo.icon;
                    const gstAmount = calculateGST(invoice.totalAmount, invoice.subtotal);
                    
                    return (
                      <div key={invoice.invoiceId} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all border border-white/5">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-lg">#{invoice.invoiceNumber}</div>
                            <div className="text-sm text-white/70">
                              {invoice.student?.course || 'Course Invoice'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl">{formatCurrency(invoice.totalAmount)}</div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                              <StatusIcon className={`w-3 h-3 mr-1 ${statusInfo.iconColor}`} />
                              {statusInfo.text}
                            </div>
                          </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-white/70 mb-1">Issue Date</div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(invoice.issueDate)}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 mb-1">Due Date</div>
                            <div className={`flex items-center ${new Date(invoice.dueDate) < new Date() && invoice.status?.toLowerCase() !== 'paid' ? 'text-red-300' : ''}`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(invoice.dueDate)}
                            </div>
                          </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="mb-4">
                          <div className="text-white/70 text-sm mb-2">Items:</div>
                          {invoice.items?.map((item, index) => (
                            <div key={item._id || index} className="flex justify-between text-sm mb-1">
                              <div className="text-white/90">
                                {item.description}
                                <span className="text-white/60 ml-2">(x{item.quantity})</span>
                              </div>
                              <div>{formatCurrency(item.amount)}</div>
                            </div>
                          ))}
                          
                          {/* GST Calculation */}
                          {gstAmount > 0 && (
                            <>
                              <div className="flex justify-between text-sm mb-1 pt-2 border-t border-white/10">
                                <div className="text-white/90">Subtotal</div>
                                <div>{formatCurrency(invoice.subtotal)}</div>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <div className="text-white/90">GST (18%)</div>
                                <div>{formatCurrency(gstAmount)}</div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t border-white/10">
                          <button
                            onClick={() => downloadInvoice(invoice)}
                            disabled={downloadingInvoice === invoice.invoiceId}
                            className="flex-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
                          >
                            {downloadingInvoice === invoice.invoiceId ? (
                              <>
                                <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => viewInvoice(invoice)}
                            className="px-4 bg-transparent border border-white/30 hover:bg-white/10 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </button>
                        </div>

                        {/* Company Info */}
                        {invoice.companyInfo && (
                          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                            <div>Issued by: {invoice.companyInfo.name}</div>
                            {invoice.companyInfo.contact && (
                              <div>Contact: {invoice.companyInfo.contact}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default PaymentOverview;