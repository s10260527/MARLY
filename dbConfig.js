module.exports = {
    user: "FSDP", // Replace with your SQL Server login username
    password: "FSDP", // Replace with your SQL Server login password
    server: "localhost",
    database: "MARLY",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };