var express = require('express');
var router = express.Router();
const StockController = require('../controller/Stock.controller')
/* GET home page. */
router.get('/overview', StockController.GetOverview);
module.exports = router;