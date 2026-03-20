# Domain Monitoring Service

A robust and scalable domain monitoring service that continuously checks the availability of multiple domains and sends email alerts when any domain becomes unavailable. Built with Node.js and automated via GitHub Actions for zero-maintenance operation.

## 🌟 Features

- **Automated Monitoring**: Checks domain availability every 2 minutes via GitHub Actions (runs 24x7)
- **GitHub Actions Powered**: No server required — fully automated via scheduled workflows
- **Email Alerts**: Sends detailed HTML email notifications when domains are down
- **Recovery Alerts**: Sends notification when a previously down domain comes back online
- **Retry Logic**: Tests each domain 2 times with retries before marking as down
- **Email Cooldown**: Prevents spam by limiting emails to once per 30 minutes per domain
- **Comprehensive Logging**: Detailed console output with timestamps and status indicators
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly
- **Environment-based Configuration**: Easy setup with .env files
- **Production Ready**: Built-in error handling and process management

## 📋 Monitored Domains

The service currently monitors the following domains:

- https://www.91trucks.com
- https://www.91tractors.com
- https://www.91infra.com
- https://trucksfloor.com
- https://motorfloor.com
- https://admin.91trucks.com
- https://forge.91trucks.com
- https://np.91trucks.com
- https://jeeto.91trucks.com
- https://cv.91trucks.com
- https://blog.91trucks.com
- https://webhook.91trucks.com
- https://bd.91trucks.com
- https://sa.91trucks.com
- https://ace-ev.91trucks.com
- https://acegold.91trucks.com
- https://tata-ace-pro.91trucks.com

> **Note**: You can easily modify the monitored domains by editing the `domains` array in `src/config.js`.

### Customizing Monitored Domains

To monitor your own domains, edit the `domains` array in `src/config.js`:

```javascript
domains: [
  'https://yourdomain.com',
  'https://api.yourdomain.com',
  'https://subdomain.yourdomain.com'
],
```

## 🚀 Quick Start & Deployment

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- SMTP email account (Gmail recommended)
- GitHub repository (for automated monitoring via Actions)

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

5. **Start the service locally**:
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

## ⚙️ GitHub Actions Automation (Recommended)

The service runs fully automated via GitHub Actions — no server or manual intervention needed.

### How It Works

- Cron triggers every 10 minutes (`*/10 * * * *`)
- Each job loops internally: checks every 2 minutes × 5 runs = covers the full 10-minute window
- Achieves approximately one domain check every 2 minutes, 24x7

> **Note**: GitHub does not guarantee exact cron timing on free plans. Delays of 10–30 minutes can occur during high-load periods. The internal loop mitigates this.

### Setting Up GitHub Actions

1. **Add GitHub Secrets** — go to your repo → Settings → Secrets and variables → Actions:

   | Secret | Description |
   |--------|-------------|
   | `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
   | `SMTP_PORT` | SMTP port (e.g. `587`) |
   | `SMTP_USER` | Your email address |
   | `SMTP_PASS` | Your app password |
   | `TO_EMAIL` | Primary recipient(s), comma-separated |
   | `CC_EMAIL` | CC recipient(s), comma-separated |
   | `FROM_EMAIL` | Sender email address |
   | `SERVICE_NAME` | Display name (e.g. `91Trucks Domain Monitor`) |

2. **Push to main branch** — the workflow activates automatically once `.github/workflows/domain-monitor.yml` is on the default branch.

3. **Trigger manually** (optional) — Actions tab → Domain Monitor → Run workflow.

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
# Start the continuous local service (uses node-cron)
npm start

# Run a single one-shot check and exit (used by GitHub Actions)
npm run check

# Start in development mode with auto-restart
npm run dev

# PM2 commands (for local/server deployment)
npm run pm2:start
npm run pm2:stop
npm run pm2:restart
npm run pm2:logs
npm run pm2:status
npm run pm2:save
```

## 📊 Service Features

### Monitoring Logic

- **Check Frequency**: Every 2 minutes via GitHub Actions (every 5 minutes locally)
- **Timeout**: 30 seconds per HTTP request
- **Retry Logic**: 2 attempts per domain before marking as down
- **Status Codes**: Considers 2xx and 3xx as successful responses
- **Parallel Checks**: All domains checked simultaneously for speed

### Email Alert System

- **Down Alerts**: Sent immediately when a domain fails after retries
- **Recovery Alerts**: Sent when a previously down domain comes back online
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
├── .github/
│   └── workflows/
│       └── domain-monitor.yml  # GitHub Actions workflow (cron + loop)
├── src/
│   ├── index.js                # Continuous local runner (node-cron)
│   ├── run-once.js             # One-shot runner used by GitHub Actions
│   ├── domainMonitor.js        # Domain check + retry logic
│   ├── emailService.js         # Email alert templates and sending
│   └── config.js               # Domains list + env config
├── ecosystem.config.js         # PM2 config (for local/server use)
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
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
| `CHECK_INTERVAL_MINUTES` | Minutes between checks (local runner) | 5 | No |
| `SERVICE_NAME` | Service display name | 91Trucks Domain Monitor | No |

## 🚨 Alert Example

When a domain goes down, you'll receive an email like this:

**Subject**: 🚨 Domain Alert: 1 domain(s) are down - Domain Monitor Service

The email includes:
- Alert summary with timestamp
- List of down domains with error details
- Status of all monitored domains
- Professional HTML formatting

When a domain recovers:

**Subject**: ✅ Domain Recovery: 1 domain(s) are back online - Domain Monitor Service

## 🔧 Troubleshooting

### Common Issues

1. **Email not sending**:
   - Verify SMTP credentials in `.env` or GitHub Secrets
   - Check if 2FA is enabled and app password is used
   - Run `npm run check` locally to test

2. **GitHub Actions not triggering on schedule**:
   - Ensure the workflow file is on the default (`main`) branch
   - GitHub may delay the first run by up to 30 minutes
   - Use the manual "Run workflow" button in the Actions tab to verify it works
   - Scheduled workflows on low-activity repos can be delayed by GitHub

3. **Service stops unexpectedly (local)**:
   - Check console output for error messages
   - Verify internet connectivity
   - Ensure all dependencies are installed
   - Use PM2 for auto-restart: `npm run pm2:start`

4. **False positive alerts**:
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

### Option 1: GitHub Actions (Recommended — No Server Needed)

1. Push code to GitHub
2. Add all required secrets (see GitHub Actions section above)
3. Done — runs automatically every 2 minutes, 24x7

### Option 2: Local / VPS with PM2

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd domain-monitor-service
   npm install
   ```

2. **Configure .env file**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   TO_EMAIL=recipient1@example.com,recipient2@example.com
   FROM_EMAIL=your-email@gmail.com
   CC_EMAIL=cc@example.com
   CHECK_INTERVAL_MINUTES=5
   SERVICE_NAME=Domain Monitor
   ```

3. **Start with PM2**:
   ```bash
   npm install -g pm2
   npm run pm2:start
   npm run pm2:save
   pm2 startup  # Follow the printed command to enable auto-start on reboot
   ```

### Deployment Checklist

- ✅ `.env` file configured with all required variables
- ✅ Domains configured in `src/config.js`
- ✅ Email credentials tested and working
- ✅ GitHub Secrets added (for Actions deployment)
- ✅ Workflow file on default branch (for Actions deployment)
- ✅ PM2 configured (for local/VPS deployment)

### Important Notes

- **Domains**: Edit `src/config.js` → `domains` array (no other code changes needed)
- **Email Recipients**: Configure in `.env` file or GitHub Secrets
- **No Code Changes Required**: All configuration is in `.env` and `config.js`
- **Environment Variables**: All sensitive data is in `.env` (already in .gitignore)

## 🔐 Security Notes

- Store sensitive credentials in environment variables only
- Use app passwords for Gmail (never use main account password)
- Consider using a dedicated email account for monitoring alerts
- Keep dependencies updated regularly
- Never commit `.env` to version control

## 📞 Support

For issues or questions about this monitoring service:
- Check the troubleshooting section in this README
- Review the console logs for detailed error messages
- Ensure your `.env` configuration or GitHub Secrets are correct

## 📄 License

MIT License - Feel free to modify and adapt for your needs.
