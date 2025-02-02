// dbConfig.js
module.exports = {
  user: "user", 
  password: "MARLY",
  server: "localhost",
  database: "MARLY",
  trustServerCertificate: true,
  requestTimeout: 30000, // e.g. 30s
  options: {
    port: 1433,
    connectionTimeout: 60000,
    // Add new options for AI suggestions
    enableArithAbort: true,
    encrypt: true,
    rowCollectionOnRequestCompletion: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};