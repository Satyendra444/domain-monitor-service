const nodemailer = require('nodemailer');
const config = require('./config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

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

  formatResponseTime(ms) {
    if (ms === null || ms === undefined) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport(config.email.smtp);
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
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }

  generateDownDomainsEmailContent(downDomains, checkResult) {
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
          ${checkResult.results.map(result => {
            const status = result.isUp ? '✅' : '❌';
            const statusColor = result.isUp ? 'green' : 'red';
            const responseTime = result.isUp ? ` (${this.formatResponseTime(result.responseTime)})` : '';
            const slowIndicator = result.isSlow ? ' ⚠️' : '';
            return `<div style="margin: 5px 0;"><span style="color: ${statusColor};">${status}</span> ${result.domain}${responseTime}${slowIndicator}</div>`;
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
${checkResult.results.map(result => {
  const status = result.isUp ? '✅' : '❌';
  const responseTime = result.isUp ? ` (${this.formatResponseTime(result.responseTime)})` : '';
  const slowIndicator = result.isSlow ? ' ⚠️' : '';
  return `${status} ${result.domain}${responseTime}${slowIndicator}`;
}).join('\n')}

---
This alert was generated automatically by ${config.service.name}.
Please check the affected domains and take necessary action.
Note: Each domain is checked ${config.monitoring.retries} times with retries before being marked as down.
    `;

    return { subject, htmlContent, textContent };
  }

  generateRecoveryEmailContent(recoveredDomains, checkResult) {
    const subject = `✅ Domain Recovery: ${recoveredDomains.length} domain(s) are back online - ${config.service.name}`;
    const alertTimeIST = this.formatToIST(checkResult.timestamp);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin: 0;">✅ Domain Recovery Alert</h2>
        </div>
        
        <h3>Recovery Summary</h3>
        <ul>
          <li><strong>Service:</strong> ${config.service.name}</li>
          <li><strong>Recovery Time:</strong> ${alertTimeIST}</li>
          <li><strong>Total Domains Monitored:</strong> ${checkResult.totalDomains}</li>
          <li><strong>Domains UP:</strong> <span style="color: green;">${checkResult.upDomains}</span></li>
          <li><strong>Domains DOWN:</strong> <span style="color: red;">${checkResult.downDomains}</span></li>
        </ul>

        <h3 style="color: #155724;">Domains Recovered:</h3>
        <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0;">
          ${recoveredDomains.map(domain => {
            const checkedIST = this.formatToIST(domain.timestamp);
            return `
            <div style="margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 3px;">
              <strong style="color: #28a745;">✅ ${domain.domain}</strong><br>
              <small><strong>Status:</strong> ${domain.status}</small><br>
              <small><strong>Response Time:</strong> ${this.formatResponseTime(domain.responseTime)}</small><br>
              <small><strong>Recovered At:</strong> ${checkedIST}</small>
            </div>
          `;
          }).join('')}
        </div>

        <h3>All Monitored Domains:</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          ${checkResult.results.map(result => {
            const status = result.isUp ? '✅' : '❌';
            const statusColor = result.isUp ? 'green' : 'red';
            const responseTime = result.isUp ? ` (${this.formatResponseTime(result.responseTime)})` : '';
            return `<div style="margin: 5px 0;"><span style="color: ${statusColor};">${status}</span> ${result.domain}${responseTime}</div>`;
          }).join('')}
        </div>

        <hr style="margin: 20px 0; border: 1px solid #e9ecef;">
        
        <div style="color: #6c757d; font-size: 12px;">
          <p>This recovery alert was generated automatically by ${config.service.name}.</p>
          <p>The domains listed above have recovered and are now accessible.</p>
        </div>
      </div>
    `;

    const textContent = `
✅ DOMAIN RECOVERY ALERT - ${config.service.name}

Recovery Time: ${alertTimeIST}
Total Domains: ${checkResult.totalDomains}
Domains UP: ${checkResult.upDomains}
Domains DOWN: ${checkResult.downDomains}

DOMAINS RECOVERED:
${recoveredDomains.map(domain => `• ${domain.domain} - Status: ${domain.status} | Response Time: ${this.formatResponseTime(domain.responseTime)} | Recovered: ${this.formatToIST(domain.timestamp)}`).join('\n')}

ALL MONITORED DOMAINS:
${checkResult.results.map(result => {
  const status = result.isUp ? '✅' : '❌';
  const responseTime = result.isUp ? ` (${this.formatResponseTime(result.responseTime)})` : '';
  return `${status} ${result.domain}${responseTime}`;
}).join('\n')}

---
This recovery alert was generated automatically by ${config.service.name}.
The domains listed above have recovered and are now accessible.
    `;

    return { subject, htmlContent, textContent };
  }

  async sendDownDomainAlert(downDomains, checkResult) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      if (!downDomains || downDomains.length === 0) {
        return true;
      }

      const { subject, htmlContent, textContent } = this.generateDownDomainsEmailContent(downDomains, checkResult);

      const mailOptions = {
        from: config.email.from,
        to: config.email.recipients.to,
        cc: config.email.recipients.cc.length > 0 ? config.email.recipients.cc : undefined,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email alert:', error.message);
      return false;
    }
  }

  async sendRecoveryAlert(recoveredDomains, checkResult) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      if (!recoveredDomains || recoveredDomains.length === 0) {
        return true;
      }

      const { subject, htmlContent, textContent } = this.generateRecoveryEmailContent(recoveredDomains, checkResult);

      const mailOptions = {
        from: config.email.from,
        to: config.email.recipients.to,
        cc: config.email.recipients.cc.length > 0 ? config.email.recipients.cc : undefined,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Recovery email sent for ${recoveredDomains.length} domain(s)`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send recovery email alert:', error.message);
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
        cc: config.email.recipients.cc.length > 0 ? config.email.recipients.cc : undefined,
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
      await this.transporter.sendMail(testMailOptions);
      console.log('✅ Test email sent successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
      return false;
    }
  }
}

module.exports = EmailService;
