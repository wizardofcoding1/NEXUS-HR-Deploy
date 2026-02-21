const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Routes - Fixed paths to include the 'src' folder
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");
const salaryRoutes = require("./src/routes/salaryRoutes");
const payrollRoutes = require("./src/routes/payrollRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const bankDetailsRoutes = require("./src/routes/bankDetailsRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const requestDemoRoutes = require("./src/routes/requestDemoRoutes");
const onboardingRoutes = require("./src/routes/onboardingRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/payrolls", payrollRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bank-details", bankDetailsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/request-demo", requestDemoRoutes);
app.use("/api/onboarding", onboardingRoutes);

// API root
app.get("/api", (req, res) => {
  res.send("API is running");
});

// Health check
app.get("/", (req, res) => {
  res.send("🚀 HRMS Backend is running");
});

module.exports = app;
