<<<<<<< HEAD
# domain-monitor-service
=======
# Domain Monitoring Service

A robust and scalable domain monitoring service that continuously checks the availability of multiple domains and sends email alerts when any domain becomes unavailable. Built with Node.js for reliability and easy deployment.

## 🌟 Features

- **Automated Monitoring**: Checks domain availability every 5 minutes (configurable)
- **Email Alerts**: Sends detailed HTML email notifications when domains are down
- **Retry Logic**: Tests each domain 2 times with retries before marking as down
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

## 🚀 Quick Start & Deployment

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- SMTP email account (Gmail recommended)

### Installation & Deployment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create .env file** in the root directory:
   ```bash
   # Windows
   notepad .env
   
   # Linux/Mac
   nano .env
   ```

3. **Configure your .env file** with the following settings:
   ```env
   # ============================================
   # SMTP Email Configuration (Required)
   # ============================================
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # ============================================
   # Email Recipients (Required)
   # ============================================
   # Primary recipient(s) - comma separated for multiple
   TO_EMAIL=recipient1@example.com,recipient2@example.com
   
   # CC recipient(s) - comma separated (Optional)
   CC_EMAIL=cc1@example.com,cc2@example.com
   
   # Email sender address (Required)
   FROM_EMAIL=your-email@gmail.com
   
   # ============================================
   # Monitoring Configuration (Optional)
   # ============================================
   CHECK_INTERVAL_MINUTES=5
   
   # ============================================
   # Service Configuration (Optional)
   # ============================================
   SERVICE_NAME=Domain Monitor Service
   ```

4. **Configure domains** (if needed):
   - Edit `src/config.js` → `domains` array
   - Add or remove domain URLs as needed

5. **Start the service**:
   ```bash
   npm start
   ```

### Deployment Checklist

✅ **Required Steps:**
- [ ] Create `.env` file with all required variables
- [ ] Set `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`, `FROM_EMAIL`
- [ ] Configure domains in `src/config.js` (if needed)
- [ ] Test email connection (service will test on startup)

✅ **Optional Steps:**
- [ ] Set `CC_EMAIL` for CC recipients
- [ ] Adjust `CHECK_INTERVAL_MINUTES` (default: 5)
- [ ] Set custom `SERVICE_NAME`

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

- **Check Frequency**: Every 5 minutes (configurable)
- **Timeout**: 30 seconds per HTTP request
- **Retry Logic**: 2 attempts per domain before marking as down
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

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com | No |
| `SMTP_PORT` | SMTP server port | 587 | No |
| `SMTP_USER` | Email username | - | **Yes** |
| `SMTP_PASS` | Email password/app password | - | **Yes** |
| `TO_EMAIL` | Primary recipient(s), comma-separated | - | **Yes** |
| `CC_EMAIL` | CC recipient(s), comma-separated | - | No |
| `FROM_EMAIL` | Email sender address | SMTP_USER | **Yes** |
| `CHECK_INTERVAL_MINUTES` | Minutes between checks | 5 | No |
| `SERVICE_NAME` | Service display name | 91Trucks Domain Monitor | No |

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
   - Service retries 2 times before marking as down
   - Check if domain is actually accessible
   - Review timeout settings (30 seconds default)

### Logs

The service provides detailed console logging:
- ✅ Successful domain checks
- ❌ Failed domain checks with error details
- 📧 Email sending status
- ⏰ Scheduled check notifications

## 🎯 Production Deployment

### Quick Deployment Steps

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd domain-monitor-service
   npm install
   ```

2. **Configure .env file** (Required):
   ```bash
   # Create .env file
   # Copy the template below and fill in your values
   ```
   
   Create `.env` file with:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   TO_EMAIL=recipient1@example.com,recipient2@example.com
   FROM_EMAIL=your-email@gmail.com
   CC_EMAIL=cc@example.com  # Optional
   CHECK_INTERVAL_MINUTES=5  # Optional
   SERVICE_NAME=Domain Monitor  # Optional
   ```

3. **Configure domains** (if needed):
   - Edit `src/config.js` to add/remove domains in the `domains` array
   - No need to change anything else in the code

4. **Test the service**:
   ```bash
   npm start
   ```

5. **Deploy with PM2** (Recommended for production):
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name "domain-monitor"
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on reboot
   ```

### Deployment Checklist

- ✅ `.env` file configured with all required variables
- ✅ Domains configured in `src/config.js`
- ✅ Email credentials tested and working
- ✅ Service tested locally before deployment
- ✅ PM2 or process manager configured (for production)

### Important Notes

- **Domains**: Edit `src/config.js` → `domains` array (no code changes needed)
- **Email Recipients**: Configure in `.env` file (TO_EMAIL, CC_EMAIL, FROM_EMAIL)
- **No Code Changes Required**: All configuration is in `.env` and `config.js`
- **Environment Variables**: All sensitive data is in `.env` (already in .gitignore)

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

****
>>>>>>> Trucks
