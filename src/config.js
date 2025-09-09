require('dotenv').config();

// Function to parse multiple email addresses from environment variables
function parseMultipleEmails(emailString) {
  if (!emailString || typeof emailString !== 'string') {
    return null;
  }
  
  // Split by comma, trim whitespace, and filter out empty strings
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));
}

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
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Additional options for Gmail
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    },
    recipients: {
      to: parseMultipleEmails(process.env.TO_EMAIL) || ['satyendra.verma@91trucks.com'],
      cc: parseMultipleEmails(process.env.CC_EMAIL) || ['vermasatyendra77@gmail.com']
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

// Validate required environment variables
function validateConfig() {
  const requiredEnvVars = {
    SMTP_USER: config.email.smtp.auth.user,
    SMTP_PASS: config.email.smtp.auth.pass,
  };

  const missingVars = [];
  for (const [varName, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all SMTP credentials are set.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
  console.log(`📧 SMTP User: ${config.email.smtp.auth.user}`);
  console.log(`📧 SMTP Pass: ${'*'.repeat(config.email.smtp.auth.pass.length)}`);
  console.log(`📧 TO Recipients: ${Array.isArray(config.email.recipients.to) ? config.email.recipients.to.join(', ') : config.email.recipients.to}`);
  console.log(`📧 CC Recipients: ${Array.isArray(config.email.recipients.cc) ? config.email.recipients.cc.join(', ') : config.email.recipients.cc}`);
}

// Run validation
validateConfig();

module.exports = config;
