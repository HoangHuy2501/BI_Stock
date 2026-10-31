var express = require('express');
var router = express.Router();
const StockController = require('../controller/Stock.controller')
const WipController = require('../controller/Wip.controller')
/* GET home page. */
router.get('/overview', StockController.GetOverview);
router.get('/detail', StockController.GetDetail);
router.get('/wip', WipController.GetWip);
module.exports = router;