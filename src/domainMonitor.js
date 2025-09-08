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
      console.log(`Checking domain: ${domain}`);
      
      const response = await axios.get(domain, {
        timeout: config.monitoring.timeout,
        validateStatus: function (status) {
          // Consider 2xx and 3xx as successful
          return status >= 200 && status < 400;
        },
        headers: {
          'User-Agent': 'Domain-Monitor-Service/1.0'
        }
      });

      console.log(`✅ ${domain} is UP (Status: ${response.status})`);
      return {
        domain,
        isUp: true,
        status: response.status,
        responseTime: response.config?.responseTime || 'N/A',
        error: null
      };
    } catch (error) {
      console.log(`❌ ${domain} is DOWN (Error: ${error.message})`);
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
    let lastResult = null;
    
    for (let attempt = 1; attempt <= config.monitoring.retries; attempt++) {
      lastResult = await this.checkDomain(domain);
      
      if (lastResult.isUp) {
        return lastResult;
      }
      
      if (attempt < config.monitoring.retries) {
        console.log(`Retrying ${domain} in 5 seconds... (Attempt ${attempt}/${config.monitoring.retries})`);
        await this.sleep(5000); // Wait 5 seconds before retry
      }
    }
    
    return lastResult;
  }

  async checkAllDomains() {
    console.log(`\\n🔍 Starting domain check at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    const results = [];
    const downDomains = [];

    for (const domain of config.domains) {
      const result = await this.checkDomainWithRetries(domain);
      const currentStatus = this.domainStatus.get(domain);
      
      result.timestamp = new Date().toISOString();
      results.push(result);

      // Update domain status
      const wasUp = currentStatus.isUp;
      currentStatus.isUp = result.isUp;
      currentStatus.lastChecked = result.timestamp;

      if (!result.isUp) {
        currentStatus.failures++;
        downDomains.push(result);
        
        // Check if this is a new failure (was up, now down)
        if (wasUp) {
          console.log(`🚨 NEW FAILURE DETECTED: ${domain}`);
        }
      } else {
        currentStatus.failures = 0; // Reset failure counter on success
      }

      this.domainStatus.set(domain, currentStatus);
    }

    console.log('='.repeat(60));
    console.log(`✅ Domains UP: ${results.filter(r => r.isUp).length}`);
    console.log(`❌ Domains DOWN: ${downDomains.length}`);
    
    if (downDomains.length > 0) {
      console.log(`\\n🚨 DOWN DOMAINS:`);
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
