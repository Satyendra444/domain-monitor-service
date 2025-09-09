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
    this.lastEmailSent = new Map(); // Track when emails were last sent for each domain
  }

  async initialize() {
    console.log(`🚀 Starting ${config.service.name}`);
    console.log('='.repeat(60));
    console.log(`📍 Monitoring ${config.domains.length} domains:`);
    config.domains.forEach((domain, index) => {
      console.log(`   ${index + 1}. ${domain}`);
    });
    console.log(`⏰ Check interval: ${config.monitoring.intervalMinutes} minutes`);
    console.log(`📧 Email TO: ${config.email.recipients.to}`);
    console.log(`📧 Email CC: ${config.email.recipients.cc}`);
    console.log('='.repeat(60));

    // Test email connection
    await this.emailService.testConnection();
    
    // Perform initial check
    console.log('\\n🔍 Performing initial domain check...');
    await this.performDomainCheck();
    
    console.log('\\n✅ Service initialized successfully!');
  }

  async performDomainCheck() {
    try {
      const checkResult = await this.domainMonitor.checkAllDomains();
      
      // Send email alerts if any domains are down
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
    console.log(`\\n🚨 Found ${downDomains.length} down domain(s), preparing email alert...`);
    
    // Filter domains that need email alerts (avoiding spam)
    const domainsNeedingAlert = this.filterDomainsForEmailAlert(downDomains);
    
    if (domainsNeedingAlert.length > 0) {
      const emailSent = await this.emailService.sendDownDomainAlert(domainsNeedingAlert, checkResult);
      
      if (emailSent) {
        // Update last email sent timestamps
        domainsNeedingAlert.forEach(domain => {
          this.lastEmailSent.set(domain.domain, Date.now());
        });
        console.log(`✅ Email alert sent for ${domainsNeedingAlert.length} domain(s)`);
      } else {
        console.error('❌ Failed to send email alert');
      }
    } else {
      console.log('📧 Skipping email alert (recent alert already sent for these domains)');
    }
  }

  filterDomainsForEmailAlert(downDomains) {
    // Don't send emails more than once every 30 minutes for the same domain
    const emailCooldownMinutes = 30;
    const cooldownMs = emailCooldownMinutes * 60 * 1000;
    const now = Date.now();

    return downDomains.filter(domain => {
      const lastEmailTime = this.lastEmailSent.get(domain.domain);
      if (!lastEmailTime) {
        return true; // Never sent an email for this domain
      }
      
      const timeSinceLastEmail = now - lastEmailTime;
      const shouldSend = timeSinceLastEmail >= cooldownMs;
      
      if (!shouldSend) {
        const minutesLeft = Math.ceil((cooldownMs - timeSinceLastEmail) / (60 * 1000));
        console.log(`📧 Cooldown active for ${domain.domain} (${minutesLeft} minutes left)`);
      }
      
      return shouldSend;
    });
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Service is already running');
      return;
    }

    // Create cron expression for the specified interval  
    const cronExpression = `*/${config.monitoring.intervalMinutes} * * * *`;
    
    console.log(`\\n⏰ Starting scheduled monitoring (every ${config.monitoring.intervalMinutes} minutes)`);
    console.log(`📅 Cron expression: ${cronExpression}`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('\\n' + '='.repeat(80));
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
    console.log('✅ Scheduled monitoring started successfully!');
    console.log(`🔄 Monitoring will run every ${config.monitoring.intervalMinutes} minutes`);
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Service is not running');
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    this.isRunning = false;
    console.log('🛑 Scheduled monitoring stopped');
  }

  async sendTestEmail() {
    console.log('\\n🧪 Sending test email...');
    const success = await this.emailService.sendTestEmail();
    return success;
  }

  getStatus() {
    const domainStatusSummary = this.domainMonitor.getDomainStatusSummary();
    
    return {
      isRunning: this.isRunning,
      intervalMinutes: config.monitoring.intervalMinutes,
      totalDomains: config.domains.length,
      domainStatus: domainStatusSummary,
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
    
    // Start the scheduled monitoring
    service.start();
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\\n\\n🛑 Received SIGINT (Ctrl+C), shutting down gracefully...');
      service.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\\n\\n🛑 Received SIGTERM, shutting down gracefully...');
      service.stop();
      process.exit(0);
    });
    
    // Log status every hour
    setInterval(() => {
      const status = service.getStatus();
      console.log(`\\n📊 Service Status - Running: ${status.isRunning}, Domains: ${status.totalDomains}`);
    }, 60 * 60 * 1000); // Every hour
    
  } catch (error) {
    console.error('💥 Failed to start domain monitoring service:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the service if this file is run directly
if (require.main === module) {
  main();
}

module.exports = DomainMonitoringService;
