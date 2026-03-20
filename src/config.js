require('dotenv').config();

// Parse multiple email addresses from comma-separated string
function parseMultipleEmails(emailString) {
  if (!emailString || typeof emailString !== 'string') {
    return null;
  }
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));
}

const config = {
  // Domains to monitor - Edit this array to add/remove domains
  domains: [
    'https://www.91trucks.com/',
    'https://blog.91trucks.com/',
    'https://jeeto.91trucks.com/',
    'https://cv.91trucks.com/',
    'https://admin.91trucks.com/',
    // 'https://inventory.91trucks.com/',
    'https://np.91trucks.com/',
    'https://bd.91trucks.com/',
    'https://sa.91trucks.com/',
    'https://ace-ev.91trucks.com/',
    'https://forge.91trucks.com/',
    'https://acegold.91trucks.com/',
    'https://tata-ace-pro.91trucks.com/',
    'https://trucksfloor.com/',
    'https://motorfloor.com/'

   // 'https://test.91trucks.com/'
  ],

  // Email configuration - All from .env file
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    },
    recipients: {
      to: parseMultipleEmails(process.env.TO_EMAIL),
      cc: parseMultipleEmails(process.env.CC_EMAIL) || []
    },
    from: process.env.FROM_EMAIL || process.env.SMTP_USER
  },

  // Monitoring configuration
  monitoring: {
    intervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES) || 5,
    timeout: 30000, // 30 seconds timeout for HTTP requests
    retries: 2, // Number of retries before marking as down
    slowResponseThreshold: parseInt(process.env.SLOW_RESPONSE_THRESHOLD) || 5000 // Alert if response time > 5 seconds (in ms)
  },

  // Service configuration
  service: {
    name: process.env.SERVICE_NAME || 'Domain Monitor Service'
  }
};

// Validate required environment variables
function validateConfig() {
  const required = {
    SMTP_USER: config.email.smtp.auth.user,
    SMTP_PASS: config.email.smtp.auth.pass,
    TO_EMAIL: config.email.recipients.to,
    FROM_EMAIL: config.email.from
  };

  const missing = [];
  for (const [name, value] of Object.entries(required)) {
    if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('\nRequired variables:');
    console.error('  - SMTP_USER: SMTP email username');
    console.error('  - SMTP_PASS: SMTP email password/app password');
    console.error('  - TO_EMAIL: Primary recipient(s), comma-separated');
    console.error('  - FROM_EMAIL: Email sender address');
    console.error('\nOptional variables:');
    console.error('  - CC_EMAIL: CC recipient(s), comma-separated');
    console.error('  - SMTP_HOST: SMTP host (default: smtp.gmail.com)');
    console.error('  - SMTP_PORT: SMTP port (default: 587)');
    console.error('  - CHECK_INTERVAL_MINUTES: Check interval (default: 5)');
    console.error('  - SLOW_RESPONSE_THRESHOLD: Slow response threshold in ms (default: 5000)');
    console.error('  - SERVICE_NAME: Service name');
    console.error('\nPlease create a .env file with these variables.');
    process.exit(1);
  }
}

validateConfig();

module.exports = config;
