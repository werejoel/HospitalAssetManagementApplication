const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require("./routes/auth");
const assetsRouter = require("./routes/assets");
const departmentsRouter = require("./routes/departments");
const usersRouter = require("./routes/users");
const suppliersRouter = require("./routes/suppliers");
const assetCategoriesRouter = require("./routes/assetCategories");
const assignmentsRouter = require("./routes/assignments");
const maintenanceRouter = require("./routes/maintenance");
const faultReportsRouter = require("./routes/faultReports");
const movementsRouter = require("./routes/movements");
const disposalsRouter = require("./routes/disposals");

//API Routes
app.use("/api/auth", authRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/asset-categories", assetCategoriesRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/fault-reports", faultReportsRouter);
app.use("/api/movements", movementsRouter);
app.use("/api/disposals", disposalsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found try agin" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`,
  );
});
