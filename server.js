const http = require('http');
const next = require('next');

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const isDevelopment = process.env.NODE_ENV !== 'production';
const listenTarget = process.env.PORT || 3000; // number (Linux) or named pipe (Windows/iisnode)

// Load next.config.ts normally (it already sets distDir: 'build')
const app = next({ dev: isDevelopment });
const handle = app.getRequestHandler();

app
    .prepare()
    .then(() => {
        console.log('Starting server with Node', process.version, 'NODE_ENV=', process.env.NODE_ENV);
        const server = http.createServer((req, res) => {
            handle(req, res);
        });

        server.listen(listenTarget, () => {
            console.log('> Ready and listening on', listenTarget);
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

