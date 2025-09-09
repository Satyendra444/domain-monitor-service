# Domain Monitoring Service

A robust and scalable domain monitoring service that continuously checks the availability of multiple domains and sends email alerts when any domain becomes unavailable. Built with Node.js for reliability and easy deployment.

## 🌟 Features

- **Automated Monitoring**: Checks domain availability every 10 minutes (configurable)
- **Email Alerts**: Sends detailed HTML email notifications when domains are down
- **Retry Logic**: Tests each domain 3 times with retries before marking as down
- **Email Cooldown**: Prevents spam by limiting emails to once per 30 minutes per domain
- **Comprehensive Logging**: Detailed console output with timestamps and status indicators
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly
- **Environment-based Configuration**: Easy setup with .env files
- **Production Ready**: Built-in error handling and process management

## 📋 Default Monitored Domains

The service is configured by default to monitor the following domains:

- https://www.91trucks.com/
- https://blog.91trucks.com/
- https://jeeto.91trucks.com/
- https://cv.91trucks.com/

> **Note**: You can easily modify the monitored domains by editing the `config.js` file in the `src/` directory.

### Customizing Monitored Domains

To monitor your own domains, edit the `domains` array in `src/config.js`:

```javascript path=null start=null
domains: [
  'https://yourdomain.com/',
  'https://api.yourdomain.com/',
  'https://subdomain.yourdomain.com/'
],
```

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
   # Email Configuration (Required)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Email Recipients (Required)
   TO_EMAIL=primary-recipient@yourdomain.com
   CC_EMAIL=secondary-recipient@yourdomain.com
   
   # Monitoring Configuration (Optional)
   CHECK_INTERVAL_MINUTES=10
   
   # Service Configuration (Optional)
   SERVICE_NAME=Domain Monitor Service
   ```

4. **Test your configuration** (optional but recommended):
   ```bash
   # Test email configuration
   node -e "const Service = require('./src/index'); const s = new Service(); s.sendTestEmail();"
   ```

5. **Start the service**:
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

Configure your desired email recipients in the `.env` file:
- **TO_EMAIL**: Primary recipient for alerts
- **CC_EMAIL**: Secondary recipient (optional)

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
| `TO_EMAIL` | Primary recipient | your-email@domain.com |
| `CC_EMAIL` | CC recipient | backup@domain.com |
| `CHECK_INTERVAL_MINUTES` | Minutes between checks | 10 |
| `SERVICE_NAME` | Service display name | Domain Monitor Service |

## 🚨 Alert Example

When a domain goes down, you'll receive an email like this:

**Subject**: 🚨 Domain Alert: 1 domain(s) are down - Domain Monitor Service

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

For issues or questions about this monitoring service:
- Check the troubleshooting section in this README
- Review the console logs for detailed error messages
- Ensure your .env configuration is correct

## 📄 License

MIT License - Feel free to modify and adapt for your needs.

---

**Built with ❤️ using Node.js - Reliable domain monitoring made simple**
