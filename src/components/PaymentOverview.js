import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentOverview = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard ki tarah yahan bhi session storage se user ID get karo
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

  const calculatePaymentPercentage = () => {
    if (!userData || !userData.totalPrice || userData.totalPrice === 0) return 0;
    const paidAmount = userData.advancePayment || 0;
    return Math.round((paidAmount / userData.totalPrice) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
        <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 mt-2">
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentOverview;