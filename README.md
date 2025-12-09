
# Domain Monitoring Service

A robust and scalable Node.js service that continuously checks the availability of multiple domains and sends email alerts when any domain becomes unavailable. Built for reliability, easy deployment, and flexible configuration.


## 🌟 Features

- **Automated Monitoring**: Checks domain availability at a configurable interval (default: every 5 minutes)
- **Email Alerts**: Sends detailed HTML email notifications when domains are down
- **Retry Logic**: Tests each domain multiple times (default: 2 retries) before marking as down
- **Email Cooldown**: Prevents spam by limiting emails to once per 30 minutes per domain
- **Comprehensive Logging**: Detailed console output with timestamps and status indicators
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly
- **Environment-based Configuration**: Easy setup with .env files
- **Production Ready**: Built-in error handling and process management


## 📋 Default Monitored Domains

By default, the service monitors the following domains (see `src/config.js`):

- https://www.91trucks.com/
- https://blog.91trucks.com/
- https://jeeto.91trucks.com/
- https://cv.91trucks.com/
- https://admin.91trucks.com/
- https://inventory.91trucks.com/
- https://np.91trucks.com/
- https://bd.91trucks.com/
- https://sa.91trucks.com/
- https://ace-ev.91trucks.com/
- https://forge.91trucks.com/
- https://acegold.91trucks.com/
- https://tata-ace-pro.91trucks.com/

> **Note**: You can easily modify the monitored domains by editing the `domains` array in `src/config.js`.

### Customizing Monitored Domains

To monitor your own domains, edit the `domains` array in `src/config.js`:

```js
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
   # Copy the example environment file (if available)
   copy .env.example .env
   # Or create a new .env file
   notepad .env
   ```

3. **Edit your `.env` file** with the following settings:
   ```env
   # Email Configuration (Required)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Email Recipients (comma-separated for multiple)
   TO_EMAIL=primary-recipient@yourdomain.com,another@yourdomain.com
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

- **Check Frequency**: Every 5 minutes by default (configurable via `CHECK_INTERVAL_MINUTES`)
- **Timeout**: 30 seconds per HTTP request
- **Retry Logic**: 2 attempts per domain before marking as down (configurable in `src/config.js`)
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
│   ├── index.js           # Main application with scheduling and service logic
│   ├── domainMonitor.js   # Domain checking and retry logic
│   ├── emailService.js    # Email notification system (HTML and text emails)
│   └── config.js          # Configuration management and environment variable parsing
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

### Example Email Output

```
🚨 DOMAIN MONITORING ALERT - 91Trucks Domain Monitor

Alert Time: 2025-12-09T12:00:00.000Z
Total Domains: 13
Domains UP: 12
Domains DOWN: 1

DOMAINS CURRENTLY DOWN:
• https://forge.91trucks.com/ - Error: Request timed out (Status: N/A) | Checked: 09/12/2025, 17:30:00 IST

ALL MONITORED DOMAINS:
✅ https://www.91trucks.com/
✅ https://blog.91trucks.com/
✅ https://jeeto.91trucks.com/
✅ https://cv.91trucks.com/
✅ https://admin.91trucks.com/
✅ https://inventory.91trucks.com/
✅ https://np.91trucks.com/
✅ https://bd.91trucks.com/
✅ https://sa.91trucks.com/
✅ https://ace-ev.91trucks.com/
❌ https://forge.91trucks.com/
✅ https://acegold.91trucks.com/
✅ https://tata-ace-pro.91trucks.com/

---
This alert was generated automatically by 91Trucks Domain Monitor.
Please check the affected domains and take necessary action.
Note: Each domain is checked 2 times with retries before being marked as down.
```

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

## 🛠️ Extending & Customizing

You can extend this service to support additional notification channels (e.g., SMS, Slack, Telegram) by adding new modules and updating the alert logic in `src/index.js` and `src/emailService.js`.

**Steps to add a new notification channel:**
1. Create a new service file (e.g., `smsService.js` or `slackService.js`)
2. Implement a method to send alerts via the new channel
3. Update the main service logic to call your new method when domains are down
4. Add configuration options to `.env` and `src/config.js` as needed

This modular approach makes it easy to integrate with any alerting system your organization uses.

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


## 📝 Changelog

All notable changes to this project will be documented here.

### [Unreleased]
- Initial public release
- Core monitoring and email alert features
- Configurable domains and intervals
- Logging and graceful shutdown

## 📄 License

MIT License - Feel free to modify and adapt for your needs.

---

## 🤝 How to Contribute

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

Please make sure to update tests as appropriate and follow the code style used in this project.
