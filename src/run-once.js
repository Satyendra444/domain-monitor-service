/**
 * One-shot runner for GitHub Actions.
 * Checks all domains once, sends alerts if needed, then exits.
 * Recovery/cooldown state is not persisted between runs — every run
 * alerts on any domain that is currently down.
 */
const DomainMonitor = require('./domainMonitor');
const EmailService = require('./emailService');
const config = require('./config');

async function main() {
  console.log(`🚀 ${config.service.name} — one-shot check`);
  console.log('='.repeat(60));
  console.log(`📍 Monitoring ${config.domains.length} domains`);
  console.log(`🕐 Run time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const monitor = new DomainMonitor();
  const emailService = new EmailService();

  const connected = await emailService.testConnection();
  if (!connected) {
    console.error('❌ Email connection failed. Aborting.');
    process.exit(1);
  }

  const result = await monitor.checkAllDomains();

  if (result.downDomainsList.length > 0) {
    console.log(`\n🚨 ${result.downDomainsList.length} domain(s) down — sending alert...`);
    const sent = await emailService.sendDownDomainAlert(result.downDomainsList, result);
    if (!sent) {
      console.error('❌ Failed to send down-domain alert email.');
      process.exit(1);
    }
    console.log('✅ Alert email sent.');
  } else {
    console.log('\n✅ All domains are up and running!');
  }

  if (result.slowDomainsList.length > 0) {
    console.log(`⚠️  ${result.slowDomainsList.length} domain(s) with slow response times (logged above).`);
  }

  console.log('\n✅ Check complete.');
}

main().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
