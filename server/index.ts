import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { seedData } from "./seed";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    console.log("[storage] DATABASE_URL not set, using in-memory storage");
    await seedData();
    console.log("✅ Database seeded successfully");

    // Register API routes and get the http server (socket.io attached there)
    const httpServer = await registerRoutes(app);

    // Serve static files from client directory
    const clientPath = path.join(process.cwd(), "client");
    app.use(express.static(clientPath));
    app.use(express.static(path.join(clientPath, "public")));

    // Serve index.html for all routes (SPA routing)
    app.get("*", (req, res) => {
      const indexPath = path.join(clientPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Error serving index.html:", err);
          res.status(404).send("index.html not found");
        }
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`🌐 Server running on http://localhost:${PORT}`);
      console.log("👉 Open this link manually in your browser.");
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
  }
}

startServer();

