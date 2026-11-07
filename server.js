require('dotenv').config();
const app = require('./server/app');
// Database is initialized when required
require('./server/config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  🚀 Product Manager Server is running!`);
  console.log(`  📡 Local: http://localhost:${PORT}`);
  console.log(`  📊 API:   http://localhost:${PORT}/api/products`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
