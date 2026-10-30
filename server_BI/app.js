
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const database = require("./src/config/connectData");
// router
var StockRouter = require('./src/routes/StockRouter')
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//api
app.use('/api/stock', StockRouter)

// Start Server
async function startServer() {
    try {
        await database.getPool();

        console.log("✅ SQL Server connected successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ SQL Server connection failed:", error.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
