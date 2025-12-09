const cron = require('node-cron');
const DomainMonitor = require('./domainMonitor');
const EmailService = require('./emailService');
const config = require('./config');

class DomainMonitoringService {
  constructor() {
    this.domainMonitor = new DomainMonitor();
    this.emailService = new EmailService();
    this.isRunning = false;
    this.cronJob = null;
    this.lastEmailSent = new Map();
  }

  async initialize() {
    console.log(`🚀 Starting ${config.service.name}`);
    console.log('='.repeat(60));
    console.log(`📍 Monitoring ${config.domains.length} domains`);
    console.log(`⏰ Check interval: ${config.monitoring.intervalMinutes} minutes`);
    console.log(`📧 Email TO: ${Array.isArray(config.email.recipients.to) ? config.email.recipients.to.join(', ') : config.email.recipients.to}`);
    if (config.email.recipients.cc.length > 0) {
      console.log(`📧 Email CC: ${config.email.recipients.cc.join(', ')}`);
    }
    console.log('='.repeat(60));

    await this.emailService.testConnection();
    await this.performDomainCheck();
  }

  async performDomainCheck() {
    try {
      const checkResult = await this.domainMonitor.checkAllDomains();
      
      if (checkResult.downDomainsList.length > 0) {
        await this.handleDownDomains(checkResult.downDomainsList, checkResult);
      } else {
        console.log('✅ All domains are up and running!');
      }

      return checkResult;
    } catch (error) {
      console.error('❌ Error during domain check:', error.message);
      throw error;
    }
  }

  async handleDownDomains(downDomains, checkResult) {
    const domainsNeedingAlert = this.filterDomainsForEmailAlert(downDomains);
    
    if (domainsNeedingAlert.length > 0) {
      const emailSent = await this.emailService.sendDownDomainAlert(domainsNeedingAlert, checkResult);
      
      if (emailSent) {
        domainsNeedingAlert.forEach(domain => {
          this.lastEmailSent.set(domain.domain, Date.now());
        });
      } else {
        console.error('❌ Failed to send email alert');
      }
    }
  }

  filterDomainsForEmailAlert(downDomains) {
    const emailCooldownMinutes = 30;
    const cooldownMs = emailCooldownMinutes * 60 * 1000;
    const now = Date.now();

    return downDomains.filter(domain => {
      const lastEmailTime = this.lastEmailSent.get(domain.domain);
      if (!lastEmailTime) {
        return true;
      }
      return (now - lastEmailTime) >= cooldownMs;
    });
  }

  start() {
    if (this.isRunning) {
      return;
    }

    const cronExpression = `*/${config.monitoring.intervalMinutes} * * * *`;

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('\n' + '='.repeat(80));
      console.log(`⏰ Scheduled check triggered at ${new Date().toISOString()}`);
      console.log('='.repeat(80));
      
      try {
        await this.performDomainCheck();
      } catch (error) {
        console.error('❌ Error in scheduled domain check:', error.message);
      }
      
      console.log('='.repeat(80));
      console.log(`⏰ Next check in ${config.monitoring.intervalMinutes} minutes`);
      console.log('='.repeat(80));
    });

    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    this.isRunning = false;
  }

  async sendTestEmail() {
    return await this.emailService.sendTestEmail();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: config.monitoring.intervalMinutes,
      totalDomains: config.domains.length,
      domainStatus: this.domainMonitor.getDomainStatusSummary(),
      lastEmailSentTimes: Array.from(this.lastEmailSent.entries()).map(([domain, timestamp]) => ({
        domain,
        lastEmailSent: new Date(timestamp).toISOString()
      }))
    };
  }
}

// Main execution
async function main() {
  const service = new DomainMonitoringService();
  
  try {
    await service.initialize();
    service.start();
    
    process.on('SIGINT', () => {
      service.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      service.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Failed to start domain monitoring service:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
});

// Start the service if this file is run directly
if (require.main === module) {
  main();
}

module.exports = DomainMonitoringService;
