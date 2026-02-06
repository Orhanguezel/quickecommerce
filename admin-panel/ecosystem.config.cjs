// /var/www/quikecommerce/admin-panel/deploy
module.exports = {
  apps: [
    {
      name: 'quickecommerce-admin',
      cwd: '/var/www/quikecommerce/admin-panel/deploy',

      // Next.js standalone server
      script: 'server.js',

      exec_mode: 'fork',
      instances: 1,

      watch: false,
      autorestart: true,

      max_memory_restart: '450M',

      min_uptime: '30s',
      max_restarts: 10,
      restart_delay: 5000,

      kill_timeout: 8000,
      listen_timeout: 10000,

      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
        NEXT_TELEMETRY_DISABLED: '1',
      },

      out_file: '/root/.pm2/logs/quickecommerce-admin.out.log',
      error_file: '/root/.pm2/logs/quickecommerce-admin.err.log',
      combine_logs: true,
      time: true,
    },
  ],
};
