var express = require('express');
var router = express.Router();
const StockController = require('../controller/Stock.controller')
const WipController = require('../controller/Wip.controller')
const ReserveController = require("../controller/Reserve.controller")
/* GET home page. */
router.get('/overview', StockController.GetOverview);
router.get('/detail', StockController.GetDetail);
router.get('/wip', WipController.GetWip);
router.get('/reserve', ReserveController.GetReserve);
router.put('/wip/lots/:id/tag', WipController.UpdateReason);
module.exports = router;