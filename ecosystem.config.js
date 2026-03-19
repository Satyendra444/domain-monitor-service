module.exports = {
  apps: [
    {
      name: 'domain-monitor',
      script: 'src/index.js',
      watch: false,
      restart_delay: 5000,       // wait 5s before restarting on crash
      max_restarts: 10,
      autorestart: true,
      env: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss IST',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true
    }
  ]
};
