const axios = require('axios');
const config = require('./config');

class DomainMonitor {
  constructor() {
    this.domainStatus = new Map();
    this.initializeDomainStatus();
  }

  initializeDomainStatus() {
    config.domains.forEach(domain => {
      this.domainStatus.set(domain, { isUp: true, lastChecked: null, failures: 0 });
    });
  }

  async checkDomain(domain) {
    try {
      const response = await axios.get(domain, {
        timeout: config.monitoring.timeout,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Domain-Monitor-Service/1.0'
        }
      });

      return {
        domain,
        isUp: true,
        status: response.status,
        responseTime: response.config?.responseTime || 'N/A',
        error: null
      };
    } catch (error) {
      return {
        domain,
        isUp: false,
        status: error.response?.status || null,
        responseTime: null,
        error: error.message
      };
    }
  }

  async checkDomainWithRetries(domain) {
    for (let attempt = 1; attempt <= config.monitoring.retries; attempt++) {
      const result = await this.checkDomain(domain);
      
      if (result.isUp) {
        return result;
      }
      
      if (attempt < config.monitoring.retries) {
        await this.sleep(5000);
      }
    }
    
    return await this.checkDomain(domain);
  }

  async checkAllDomains() {
    console.log(`\n🔍 Starting domain check at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    const results = [];
    const downDomains = [];

    for (const domain of config.domains) {
      const result = await this.checkDomainWithRetries(domain);
      const currentStatus = this.domainStatus.get(domain);
      
      result.timestamp = new Date().toISOString();
      results.push(result);

      const wasUp = currentStatus.isUp;
      currentStatus.isUp = result.isUp;
      currentStatus.lastChecked = result.timestamp;

      if (!result.isUp) {
        currentStatus.failures++;
        downDomains.push(result);
        if (wasUp) {
          console.log(`🚨 NEW FAILURE: ${domain}`);
        }
      } else {
        currentStatus.failures = 0;
      }

      this.domainStatus.set(domain, currentStatus);
    }

    console.log('='.repeat(60));
    console.log(`✅ Domains UP: ${results.filter(r => r.isUp).length}`);
    console.log(`❌ Domains DOWN: ${downDomains.length}`);
    
    if (downDomains.length > 0) {
      console.log(`\n🚨 DOWN DOMAINS:`);
      downDomains.forEach(result => {
        console.log(`   - ${result.domain} (Error: ${result.error})`);
      });
    }

    return {
      timestamp: new Date().toISOString(),
      totalDomains: config.domains.length,
      upDomains: results.filter(r => r.isUp).length,
      downDomains: downDomains.length,
      results,
      downDomainsList: downDomains
    };
  }

  getDomainStatusSummary() {
    const summary = [];
    for (const [domain, status] of this.domainStatus.entries()) {
      summary.push({
        domain,
        isUp: status.isUp,
        lastChecked: status.lastChecked,
        failures: status.failures
      });
    }
    return summary;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DomainMonitor;
