const axios = require('axios');
const config = require('./config');

class DomainMonitor {
  constructor() {
    this.domainStatus = new Map();
    this.initializeDomainStatus();
  }

  initializeDomainStatus() {
    config.domains.forEach(domain => {
      this.domainStatus.set(domain, { 
        isUp: true, 
        lastChecked: null, 
        failures: 0,
        lastResponseTime: null,
        wasDown: false // Track previous state for recovery detection
      });
    });
  }

  async checkDomain(domain) {
    const startTime = Date.now();
    try {
      const response = await axios.get(domain, {
        timeout: config.monitoring.timeout,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Domain-Monitor-Service/1.0'
        }
      });

      const responseTime = Date.now() - startTime;
      const isSlow = responseTime > config.monitoring.slowResponseThreshold;

      return {
        domain,
        isUp: true,
        status: response.status,
        responseTime,
        isSlow,
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        domain,
        isUp: false,
        status: error.response?.status || null,
        responseTime,
        isSlow: false,
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
        await this.sleep(5000);
      }
    }
    
    return lastResult;
  }

  formatResponseTime(ms) {
    if (ms === null || ms === undefined) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  async checkAllDomains() {
    console.log(`\n🔍 Starting domain check at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    // Parallel checking for faster execution
    const checkPromises = config.domains.map(domain => 
      this.checkDomainWithRetries(domain)
    );

    const results = await Promise.all(checkPromises);
    const downDomains = [];
    const slowDomains = [];
    const recoveredDomains = [];

    results.forEach(result => {
      const currentStatus = this.domainStatus.get(result.domain);
      result.timestamp = new Date().toISOString();
      
      const wasUp = currentStatus.isUp;
      const wasDown = currentStatus.wasDown;
      
      currentStatus.isUp = result.isUp;
      currentStatus.lastChecked = result.timestamp;
      currentStatus.lastResponseTime = result.responseTime;

      if (!result.isUp) {
        currentStatus.failures++;
        downDomains.push(result);
        currentStatus.wasDown = true;
        
        if (wasUp) {
          console.log(`🚨 NEW FAILURE: ${result.domain}`);
        }
      } else {
        currentStatus.failures = 0;
        
        // Check for recovery
        if (wasDown) {
          recoveredDomains.push(result);
          currentStatus.wasDown = false;
          console.log(`✅ RECOVERED: ${result.domain}`);
        }
      }

      // Check for slow response
      if (result.isUp && result.isSlow) {
        slowDomains.push(result);
        console.log(`⚠️ SLOW RESPONSE: ${result.domain} (${this.formatResponseTime(result.responseTime)})`);
      }

      this.domainStatus.set(result.domain, currentStatus);
    });

    console.log('='.repeat(60));
    console.log(`✅ Domains UP: ${results.filter(r => r.isUp).length}`);
    console.log(`❌ Domains DOWN: ${downDomains.length}`);
    if (slowDomains.length > 0) {
      console.log(`⚠️ Slow Domains: ${slowDomains.length}`);
    }
    if (recoveredDomains.length > 0) {
      console.log(`🔄 Recovered Domains: ${recoveredDomains.length}`);
    }
    
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
      slowDomains: slowDomains.length,
      results,
      downDomainsList: downDomains,
      slowDomainsList: slowDomains,
      recoveredDomainsList: recoveredDomains
    };
  }

  getDomainStatusSummary() {
    const summary = [];
    for (const [domain, status] of this.domainStatus.entries()) {
      summary.push({
        domain,
        isUp: status.isUp,
        lastChecked: status.lastChecked,
        failures: status.failures,
        lastResponseTime: status.lastResponseTime
      });
    }
    return summary;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DomainMonitor;
