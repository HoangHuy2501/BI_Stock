var express = require('express');
var router = express.Router();
const StockController = require('../controller/Stock.controller')
/* GET home page. */
router.get('/overview', StockController.GetOverview);
router.get('/detail', StockController.GetDetail);
module.exports = router;