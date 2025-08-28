module.exports = {
  apps: [{
    name: 'quantum-trading-suite',
    script: 'npm',
    args: 'run dev',  // Changed to development mode
    cwd: '/home/user/webapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',  // Changed to development
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};