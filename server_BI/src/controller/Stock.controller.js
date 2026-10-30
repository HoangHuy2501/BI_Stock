
const StockService = require('../services/Stock.service')
const ApiSuccess = require('../utils/ApiSuccess')


exports.GetOverview = async (req, res, next) => {
    try {
        // const monthWarehouseLedger = await StockService.monthWarehouseLedge()
        const [
            annualSummary,
            categorySummary,
            warehouseSummary,
            buyerRank,
            agedRank,
            monthWarehouseLedger
        ] = await Promise.all([
            StockService.AnnualSummary(),
            StockService.CategorySummary(),
            StockService.WarehouseSummary(),
            StockService.BuyerRank(),
            StockService.AgedRank(),
            StockService.monthWarehouseLedge(),
        ])

        return res.json(ApiSuccess.getSelect('overview', {
            annualSummary,
            categorySummary,
            warehouseSummary,
            buyerRank, agedRank,
            monthWarehouseLedger
        }));
    } catch (error) {
        return next(error)
    }
}
