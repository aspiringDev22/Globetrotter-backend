import express from "express";
import dotenv from "dotenv";
import destinationsRoutes from "./routes/destinationsRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use("/api/destinations", destinationsRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
