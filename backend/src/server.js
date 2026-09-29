import app from "./app.js";
import env from "./config/env.js";
import db from "./db/database.js";

//Starts the Express server listening on the configured network port
const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

//Gracefully closes the HTTP server and database connection before exiting the process
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

//Listens for system termination signals (like Ctrl+C) to trigger the graceful shutdown sequence
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
