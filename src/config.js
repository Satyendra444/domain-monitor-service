require('dotenv').config();

const config = {
  // Domains to monitor
  domains: [
    'https://www.91trucks.com/',
    'https://blog.91trucks.com/',
    'https://jeeto.91trucks.com/',
    'https://cv.91trucks.com/'
  ],

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    recipients: {
      to: process.env.TO_EMAIL || 'satyendra.verma@91trucks.com',
      cc: process.env.CC_EMAIL || 'vermasatyendra77@gmail.com'
    },
    from: process.env.SMTP_USER
  },

  // Monitoring configuration
  monitoring: {
    intervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES) || 10,
    timeout: 30000, // 30 seconds timeout for HTTP requests
    retries: 3 // Number of retries before marking as down
  },

  // Service configuration
  service: {
    name: process.env.SERVICE_NAME || '91Trucks Domain Monitor'
  }
};

module.exports = config;
