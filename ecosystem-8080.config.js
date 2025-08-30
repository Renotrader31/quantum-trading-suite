module.exports = {
  apps: [{
    name: 'quantum-trading-suite-8080',
    script: 'npm',
    args: 'run dev -- --port 8080',
    cwd: '/home/user/webapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 8080
    }
  }]
};