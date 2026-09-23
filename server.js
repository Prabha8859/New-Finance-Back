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

app.use("/api/auth", require("./routes/auth.routes"));

app.use("/api/personal-loan", require("./routes/personalLoan.routes"));
app.use("/api/business-loan", require("./routes/businessLoan.routes"));

app.use("/api/masters", require("./routes/master.routes"));

app.use("/api/admin", require("./routes/admin"));

/* ============================
   Error Handler
============================ */

app.use(require("./middleware/errorHandler"));

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