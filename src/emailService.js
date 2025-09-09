const nodemailer = require('nodemailer');
const config = require('./config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Format an ISO timestamp string to India Standard Time (Asia/Kolkata)
  formatToIST(isoString) {
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return isoString;
      const formatted = date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return `${formatted} IST`;
    } catch (_) {
      return isoString;
    }
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport(config.email.smtp);
      // console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await this.transporter.verify();
      // console.log('✅ Email connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }

  generateDownDomainsEmailContent(downDomains, checkResult) {
    const downDomainsList = downDomains.map(domain => 
      `• ${domain.domain} - Error: ${domain.error} (Status: ${domain.status || 'N/A'})`
    ).join('\\n');

    const subject = `🚨 Domain Alert: ${downDomains.length} domain(s) are down - ${config.service.name}`;
    const alertTimeIST = this.formatToIST(checkResult.timestamp);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: #721c24; margin: 0;">🚨 Domain Monitoring Alert</h2>
        </div>
        
        <h3>Alert Summary</h3>
        <ul>
          <li><strong>Service:</strong> ${config.service.name}</li>
          <li><strong>Alert Time:</strong> ${alertTimeIST}</li>
          <li><strong>Total Domains Monitored:</strong> ${checkResult.totalDomains}</li>
          <li><strong>Domains UP:</strong> <span style="color: green;">${checkResult.upDomains}</span></li>
          <li><strong>Domains DOWN:</strong> <span style="color: red;">${checkResult.downDomains}</span></li>
        </ul>

        <h3 style="color: #721c24;">Domains Currently Down:</h3>
        <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0;">
          ${downDomains.map(domain => {
            const checkedIST = this.formatToIST(domain.timestamp);
            return `
            <div style="margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 3px;">
              <strong style="color: #dc3545;">❌ ${domain.domain}</strong><br>
              <small><strong>Error:</strong> ${domain.error}</small><br>
              ${domain.status ? `<small><strong>HTTP Status:</strong> ${domain.status}</small><br>` : ''}
              <small><strong>Checked:</strong> ${checkedIST}</small>
            </div>
          `;
          }).join('')}
        </div>

        <h3>All Monitored Domains:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          ${config.domains.map(domain => {
            const domainResult = checkResult.results.find(r => r.domain === domain);
            const status = domainResult?.isUp ? '✅' : '❌';
            const statusColor = domainResult?.isUp ? 'green' : 'red';
            return `<div style="margin: 5px 0;"><span style="color: ${statusColor};">${status}</span> ${domain}</div>`;
          }).join('')}
        </div>

        <hr style="margin: 20px 0; border: 1px solid #e9ecef;">
        
        <div style="color: #6c757d; font-size: 12px;">
          <p>This alert was generated automatically by ${config.service.name}.</p>
          <p>Please check the affected domains and take necessary action.</p>
          <p><strong>Note:</strong> Each domain is checked ${config.monitoring.retries} times with retries before being marked as down.</p>
        </div>
      </div>
    `;

    const textContent = `
🚨 DOMAIN MONITORING ALERT - ${config.service.name}

Alert Time: ${alertTimeIST}
Total Domains: ${checkResult.totalDomains}
Domains UP: ${checkResult.upDomains}
Domains DOWN: ${checkResult.downDomains}

DOMAINS CURRENTLY DOWN:
${downDomains.map(domain => `• ${domain.domain} - Error: ${domain.error} (Status: ${domain.status || 'N/A'}) | Checked: ${this.formatToIST(domain.timestamp)}`).join('\n')}

ALL MONITORED DOMAINS:
${config.domains.map(domain => {
  const domainResult = checkResult.results.find(r => r.domain === domain);
  const status = domainResult?.isUp ? '✅' : '❌';
  return `${status} ${domain}`;
}).join('\\n')}

---
This alert was generated automatically by ${config.service.name}.
Please check the affected domains and take necessary action.
Note: Each domain is checked ${config.monitoring.retries} times with retries before being marked as down.
    `;

    return { subject, htmlContent, textContent };
  }

  async sendDownDomainAlert(downDomains, checkResult) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      if (!downDomains || downDomains.length === 0) {
         console.log('📧 No down domains to report');
        return true;
      }

      const { subject, htmlContent, textContent } = this.generateDownDomainsEmailContent(downDomains, checkResult);

      const mailOptions = {
        from: config.email.from,
        to: config.email.recipients.to,
        cc: config.email.recipients.cc,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      // console.log(`📧 Sending email alert for ${downDomains.length} down domain(s)...`);
      
      const info = await this.transporter.sendMail(mailOptions);
      // console.log('✅ Email alert sent successfully:', info.messageId);
      const toRecipients = Array.isArray(config.email.recipients.to) ? config.email.recipients.to.join(', ') : config.email.recipients.to;
      const ccRecipients = Array.isArray(config.email.recipients.cc) ? config.email.recipients.cc.join(', ') : config.email.recipients.cc;
      // console.log(`📧 Recipients: TO: ${toRecipients}, CC: ${ccRecipients}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send email alert:', error);
      return false;
    }
  }

  async sendTestEmail() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const testMailOptions = {
        from: config.email.from,
        to: config.email.recipients.to,
        cc: config.email.recipients.cc,
        subject: `🧪 Test Email - ${config.service.name}`,
        text: `This is a test email from ${config.service.name}. If you receive this, email notifications are working correctly.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🧪 Test Email - ${config.service.name}</h2>
            <p>This is a test email to verify that email notifications are working correctly.</p>
            <p><strong>Service:</strong> ${config.service.name}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p>If you receive this email, the email notification system is functioning properly.</p>
          </div>
        `
      };

       console.log('📧 Sending test email...');
      const info = await this.transporter.sendMail(testMailOptions);
       console.log('✅ Test email sent successfully:', info.messageId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
      return false;
    }
  }
}

module.exports = EmailService;
