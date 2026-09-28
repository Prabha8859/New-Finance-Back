require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();

/* ============================
   Database Connection
============================ */
connectDB();

/* ============================
   Middlewares
============================ */
app.use(helmet());

// Explicit origin allowlist — never leave this as bare cors() in a project
// handling financial/PII data (see SECURITY-PLAN.md §3).
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(morgan("dev"));

/* ============================
   Health Check
============================ */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Indexia Finance Backend Running"
    });
});

/* ============================
   Routes
============================ */

app.use("/api/auth", require("./modules/auth/auth.routes"));

app.use("/api/personal-loan", require("./modules/loans/routes/personalLoan.routes"));
app.use("/api/business-loan", require("./modules/loans/routes/businessLoan.routes"));
app.use("/api/home-loan", require("./modules/loans/routes/homeLoan.routes"));
app.use("/api/loan-against-property", require("./modules/loans/routes/loanAgainstProperty.routes"));
app.use("/api/balance-transfer", require("./modules/loans/routes/balanceTransfer.routes"));
app.use("/api/project-loan", require("./modules/loans/routes/projectLoan.routes"));
app.use("/api/car-loan", require("./modules/loans/routes/carLoan.routes"));
app.use("/api/education-loan", require("./modules/loans/routes/educationLoan.routes"));
app.use("/api/credit-card", require("./modules/loans/routes/creditCard.routes"));

app.use("/api/masters", require("./modules/masters/master.routes"));
app.use("/api/employment-types", require("./modules/masters/employmentType.routes"));

app.use("/api/admin", require("./modules/admin"));

/* ============================
   Error Handler
============================ */

app.use(require("./shared/middleware/errorHandler"));

/* ============================
   Server
============================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("===================================");

    console.log(`🚀 Server Running On Port ${PORT}`);

    console.log(`🌍 http://localhost:${PORT}`);

    console.log("===================================");

});