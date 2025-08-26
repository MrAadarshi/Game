// Payment Configuration
// Update these details with your actual payment information

export const paymentConfig = {
  // UPI Payment Details
  upi: {
    upiId: 'admin@upi', // Replace with your actual UPI ID
    qrCodeUrl: 'https://your-qr-code-url.com/qr.png', // Replace with your QR code image URL
    displayName: 'Admin Name' // Replace with your display name
  },
  
  // Payment Instructions
  instructions: {
    deposit: [
      'Send exactly the requested amount',
      'Add your username as payment note/reference',
      'Submit the deposit request after payment',
      'Wait for admin approval (usually within 24 hours)',
      'Contact support if payment is not processed within 48 hours'
    ],
    withdrawal: [
      'Ensure you have sufficient balance',
      'Provide correct payment details',
      'Wait for admin processing (usually within 24 hours)',
      'Contact support if withdrawal is not processed within 48 hours'
    ]
  },
  
  // Payment Limits
  limits: {
    deposit: {
      min: 100,
      max: 100000
    },
    withdrawal: {
      min: 100,
      max: 100000
    }
  },
  
  // Processing Times
  processingTimes: {
    deposit: '24 hours',
    withdrawal: '24 hours',
    support: '48 hours'
  }
};

export default paymentConfig; 