require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes       = require("./routes/auth");
const userRoutes       = require("./routes/user");
const departmentRoutes = require("./routes/departments");
const skillRoutes      = require("./routes/skills");
const employeeRoutes   = require("./routes/employees");
const leaveRoutes      = require("./routes/leave");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",        authRoutes);
app.use("/api/user",        userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills",      skillRoutes);
app.use("/api/employees",   employeeRoutes);
app.use("/api/leave",       leaveRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});