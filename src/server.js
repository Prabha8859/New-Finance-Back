require("./config/env");

const connectDB = require("./config/database");
const app = require("./app");

/* ============================
   Database
============================ */
connectDB();

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
