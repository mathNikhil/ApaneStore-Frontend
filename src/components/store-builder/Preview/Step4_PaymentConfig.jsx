import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ============================================
// UPI QR CODE GENERATOR FUNCTION
// ============================================
const generateUPIQR = (upiId, amount, merchantName) => {
  if (!upiId) return null;
  
  // Build the UPI payment URL
  const encodedName = encodeURIComponent(merchantName || 'Store');
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount || ''}&cu=INR`;
  
  // Generate QR code using Google Chart API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=006d2f`;
  
  return {
    upiUrl,
    qrCodeUrl,
    upiId
  };
};

// ============================================
// MAIN PAYMENT PAGE COMPONENT
// ============================================
const PaymentPage = ({ showToast }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [showQR, setShowQR] = useState(false);
  const [upiQRData, setUpiQRData] = useState(null);
  const [upiId, setUpiId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (!savedOrder) {
      navigate('/cart');
      return;
    }

    try {
      const order = JSON.parse(savedOrder);
      console.log('Order details loaded:', order);
      setOrderDetails(order);
      
      // Load store UPI ID from config (mock for now)
      // In production, this would come from store settings
      const mockUpiId = 'store@upi'; // Replace with actual store UPI ID
      setUpiId(mockUpiId);
      
      // Generate QR code for UPI
      if (mockUpiId) {
        const qrData = generateUPIQR(mockUpiId, order.total || 0, 'Your Store');
        setUpiQRData(qrData);
      }
    } catch (error) {
      console.error('Error parsing order:', error);
      navigate('/cart');
    }
  }, [navigate]);

  const handlePlaceOrder = async () => {
    if (!orderDetails) {
      if (showToast) showToast('No order details', 'error');
      return;
    }

    // If UPI is selected, show QR code for payment
    if (selectedMethod === 'upi') {
      setShowQR(true);
      return;
    }

    // For COD, proceed directly
    await processOrder();
  };

  const processOrder = async () => {
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        if (showToast) showToast('Please login first', 'error');
        navigate('/login');
        return;
      }

      // Transform address
      const originalAddress = orderDetails.address || {};
      const formattedAddress = {
        recipientName: originalAddress.recipient_name || originalAddress.recipientName || 'Customer',
        recipientMobile: originalAddress.recipient_mobile || originalAddress.recipientMobile || '',
        fullAddress: originalAddress.fullAddress || `${originalAddress.address_line1 || originalAddress.addressLine1 || ''} ${originalAddress.address_line2 || originalAddress.addressLine2 || ''}, ${originalAddress.city || ''}, ${originalAddress.state || ''} - ${originalAddress.pincode || ''}`,
        addressLine1: originalAddress.address_line1 || originalAddress.addressLine1 || '',
        addressLine2: originalAddress.address_line2 || originalAddress.addressLine2 || '',
        city: originalAddress.city || '',
        state: originalAddress.state || '',
        pincode: originalAddress.pincode || '',
        label: originalAddress.label || 'Home'
      };

      // Format items
      const items = (orderDetails.items || []).map(item => ({
        name: item.name || '',
        weight: item.weight || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      }));

      const response = await api.placeOrder(
        formattedAddress,
        orderDetails.deliverySlot,
        selectedMethod,
        items,
        orderDetails.subtotal || 0,
        orderDetails.deliveryFee || 0,
        orderDetails.gst || 0,
        orderDetails.total || 0
      );

      console.log('Place order response:', response);

      if (response.success && response.orderId) {
        // Clear cart and order data
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('cart');
        localStorage.removeItem('selectedSlot');
        localStorage.removeItem('selectedAddress');
        localStorage.removeItem('selectedAddressLabel');
        
        window.dispatchEvent(new Event('cartUpdated'));
        
        if (showToast) showToast('Order placed successfully!', 'success');
        
        navigate(`/order-success?orderId=${response.orderId}`);
      } else {
        if (showToast) showToast(response.error || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (showToast) showToast(error.message || 'Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
      setShowQR(false);
    }
  };

  const handleQRPaymentComplete = () => {
    // User has scanned QR and paid
    // Proceed to order processing
    setShowQR(false);
    processOrder();
  };

  const handleCopyUPI = () => {
    if (upiQRData?.upiId) {
      navigator.clipboard.writeText(upiQRData.upiId);
      if (showToast) showToast('UPI ID copied!', 'success');
    }
  };

  if (!orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { address, deliverySlot, items, subtotal, deliveryFee, gst, total } = orderDetails;
  const totalItems = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const displayName = address?.recipient_name || address?.recipientName || 'Customer';
  const displayMobile = address?.recipient_mobile || address?.recipientMobile || '';
  const displayAddress = address?.fullAddress || 
    `${address?.address_line1 || address?.addressLine1 || ''} ${address?.address_line2 || address?.addressLine2 || ''}, ${address?.city || ''}, ${address?.state || ''} - ${address?.pincode || ''}`;

  // ============================================
  // RENDER UPI QR CODE VIEW
  // ============================================
  if (showQR && upiQRData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <button 
            onClick={() => setShowQR(false)}
            className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Payment
          </button>

          <div className="bg-white rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan to Pay</h2>
            <p className="text-gray-500 text-sm mb-6">Pay using any UPI app</p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <img 
                  src={upiQRData.qrCodeUrl} 
                  alt="UPI QR Code"
                  className="w-64 h-64"
                  onError={(e) => {
                    // Fallback if QR generation fails
                    e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(upiQRData.upiUrl)}`;
                  }}
                />
              </div>
            </div>

            {/* UPI ID */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Pay to UPI ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-lg font-semibold text-gray-800">{upiQRData.upiId}</span>
                <button 
                  onClick={handleCopyUPI}
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary">₹{total?.toFixed(2) || 0}</p>
            </div>

            {/* Payment Instructions */}
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-800 mb-2">📌 Instructions</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>2. Scan the QR code above</li>
                <li>3. Verify the amount and pay</li>
                <li>4. After payment, click "I've Paid" below</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleQRPaymentComplete}
                className="w-full bg-primary text-white py-3 rounded-full font-bold text-lg shadow-lg hover:bg-primary-dark transition-all"
              >
                I've Paid
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="w-full border border-gray-300 text-gray-600 py-3 rounded-full font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PAYMENT SELECTION VIEW
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment</h1>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
          
          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-600">{displayAddress}</p>
            <p className="text-sm text-gray-600">📞 {displayMobile}</p>
          </div>

          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-1">Delivery Slot</p>
            <p className="font-medium">{deliverySlot}</p>
          </div>

          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-2">Items ({totalItems})</p>
            {items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm mb-2">
                <span>{item.name} - {item.weight} x {item.quantity}</span>
                <span className="font-medium">₹{(item.price || 0) * (item.quantity || 0)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{subtotal?.toFixed(2) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee?.toFixed(2) || 0}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span>₹{gst?.toFixed(2) || 0}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{total?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Choose Payment Method</h2>
          
          <div className="space-y-3">
            {/* UPI Option */}
            <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${selectedMethod === 'upi' ? 'border-primary bg-primary/5' : ''}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={selectedMethod === 'upi'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <div>
                  <p className="font-medium">UPI / GPay / PhonePe</p>
                  <p className="text-xs text-gray-500">Pay using any UPI app</p>
                </div>
              </div>
              <span className="text-2xl">📱</span>
            </label>

            {/* COD Option */}
            <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${selectedMethod === 'cod' ? 'border-primary bg-primary/5' : ''}`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={selectedMethod === 'cod'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive your order</p>
                </div>
              </div>
              <span className="text-2xl">💵</span>
            </label>

            {/* Coming Soon - Cards & Wallets */}
            <div className="p-3 border border-dashed border-gray-300 rounded-xl bg-gray-50 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">credit_card</span>
                  <div>
                    <p className="font-medium text-gray-400">Cards & Digital Wallets</p>
                    <p className="text-xs text-gray-400">Coming Soon</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">🚀 Phase 2</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? 'Placing Order...' : `Pay ₹${total?.toFixed(2) || 0}`}
        </button>

        {/* Legal Disclaimer */}
        <p className="text-xs text-center text-gray-400 mt-4">
          🔒 ApnaEstore is a software provider only. We do not handle any money. 
          All payments are processed directly between you and the store.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;