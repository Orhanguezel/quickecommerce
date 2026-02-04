
// /var/www/sportoonline/admin-panel/deploy
module.exports = {
  apps: [
    {
      name: 'sportoonline-admin-panel',
      cwd: '/var/www/sportoonline/admin-panel/deploy',

      // Next.js start via Bun
      script: '/home/orhan/.bun/bin/bun',
      args: 'run start -- -p 3025 -H 127.0.0.1',

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
        PORT: '3025',
        HOSTNAME: '127.0.0.1',
        NEXT_TELEMETRY_DISABLED: '1',
      },

      out_file: '/home/orhan/.pm2/logs/sportoonline-admin-panel.out.log',
      error_file: '/home/orhan/.pm2/logs/sportoonline-admin-panel.err.log',
      combine_logs: true,
      time: true,
    },
  ],
};


