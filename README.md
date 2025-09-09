# 91Trucks Domain Monitoring Service

A robust domain monitoring service that checks the availability of multiple domains every 10 minutes and sends email alerts when any domain becomes unavailable.

## 🌟 Features

- **Automated Monitoring**: Checks domain availability every 10 minutes (configurable)
- **Email Alerts**: Sends detailed email notifications when domains are down
- **Retry Logic**: Tests each domain 3 times with retries before marking as down
- **Email Cooldown**: Prevents spam by limiting emails to once per 30 minutes per domain
- **Comprehensive Logging**: Detailed console output with timestamps and status
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly
- **Easy Configuration**: Environment-based configuration

## 📋 Monitored Domains

The service monitors the following 91Trucks domains:

- https://www.91trucks.com/
- https://blog.91trucks.com/
- https://jeeto.91trucks.com/
- https://cv.91trucks.com/

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- SMTP email account (Gmail recommended)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   # Copy the example environment file
   copy  .env
   
   # Edit .env with your email settings
   notepad .env
   ```

3. **Configure your .env file** with the following settings:
   ```env
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Recipients (already configured for 91Trucks)
   TO_EMAIL=satyendra.verma@91trucks.com
   CC_EMAIL=vermasatyendra77@gmail.com
   
   # Monitoring Configuration
   CHECK_INTERVAL_MINUTES=10
   
   # Service Configuration
   SERVICE_NAME=91Trucks Domain Monitor
   ```

4. **Start the service**:
   ```bash
   npm start
   ```

## 📧 Email Configuration

### For Gmail Users

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated app password in your `.env` file

### Email Recipients

The service is pre-configured to send alerts to:
- **TO**: satyendra.verma@91trucks.com
- **CC**: vermasatyendra77@gmail.com

## 🛠️ Available Scripts

```bash
# Start the service in production mode
npm start

# Start in development mode with auto-restart
npm run dev

# Test email configuration
node -e "const Service = require('./src/index'); const s = new Service(); s.sendTestEmail();"
```

## 📊 Service Features

### Monitoring Logic

- **Check Frequency**: Every 10 minutes (configurable)
- **Timeout**: 30 seconds per HTTP request
- **Retry Logic**: 3 attempts per domain before marking as down
- **Status Codes**: Considers 2xx and 3xx as successful responses

### Email Alert System

- **Rich HTML Emails**: Professional-looking email with status summary
- **Alert Cooldown**: Maximum one email per domain every 30 minutes
- **Comprehensive Details**: Includes error messages, HTTP status codes, and timestamps
- **All Domain Status**: Shows status of all monitored domains in each alert

### Logging

- Real-time console output with emojis and clear formatting
- Detailed error messages and status updates
- Scheduled check notifications
- Service status summaries

## 🗂️ Project Structure

```
domain-monitor-service/
├── src/
│   ├── index.js           # Main application with scheduling
│   ├── domainMonitor.js   # Domain checking logic
│   ├── emailService.js    # Email notification system
│   └── config.js          # Configuration management
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## ⚙️ Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password/app password | - |
| `TO_EMAIL` | Primary recipient | satyendra.verma@91trucks.com |
| `CC_EMAIL` | CC recipient | vermasatyendra77@gmail.com |
| `CHECK_INTERVAL_MINUTES` | Minutes between checks | 10 |
| `SERVICE_NAME` | Service display name | 91Trucks Domain Monitor |

## 🚨 Alert Example

When a domain goes down, you'll receive an email like this:

**Subject**: 🚨 Domain Alert: 1 domain(s) are down - 91Trucks Domain Monitor

The email includes:
- Alert summary with timestamp
- List of down domains with error details
- Status of all monitored domains
- Professional HTML formatting

## 🔧 Troubleshooting

### Common Issues

1. **Email not sending**:
   - Verify SMTP credentials in `.env`
   - Check if 2FA is enabled and app password is used
   - Test with `npm run test-email` (if implemented)

2. **Service stops unexpectedly**:
   - Check console output for error messages
   - Verify internet connectivity
   - Ensure all dependencies are installed

3. **False positive alerts**:
   - Service retries 3 times before marking as down
   - Check if domain is actually accessible
   - Review timeout settings (30 seconds default)

### Logs

The service provides detailed console logging:
- ✅ Successful domain checks
- ❌ Failed domain checks with error details
- 📧 Email sending status
- ⏰ Scheduled check notifications

## 🎯 Production Deployment

For production deployment:

1. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "domain-monitor"
   pm2 save
   pm2 startup
   ```

2. **Set up proper logging**:
   - PM2 handles log rotation automatically
   - Logs available via `pm2 logs domain-monitor`

3. **Monitor the service**:
   - Use `pm2 status` to check service health
   - Set up system alerts for the monitoring service itself

## 🔐 Security Notes

- Store sensitive credentials in environment variables only
- Use app passwords for Gmail (never use main account password)
- Consider using a dedicated email account for monitoring alerts
- Keep dependencies updated regularly

## 📞 Support

For issues or questions about this monitoring service, contact:
- **Email**: satyendra.verma@91trucks.com
- **CC**: vermasatyendra77@gmail.com

## 📄 License

MIT License - Feel free to modify and adapt for your needs.

---

**Made with ❤️ for 91Trucks - Keeping your domains monitored 24/7**
