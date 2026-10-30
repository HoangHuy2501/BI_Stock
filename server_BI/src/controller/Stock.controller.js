
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

exports.GetDetail = async (req, res, next) => {
    try {
        const data = {
            lot: req.query.lot,
            item: req.query.item,
            code: req.query.code,
            buyer: req.query.buyer,
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 25)
        };
        const items = await StockService.detail(data);
        return res.json(ApiSuccess.getSelect('detail', items))
    } catch (error) {
        return next(error)
    }
}