module.exports = {
    apps: [
      {
        name: 'woothomes-frontend',
        script: 'npm run start',
        cwd: '/home/site/wwwroot',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.PORT || 3000
        }
      }
    ]
  };
