
const StockService = require('../services/Stock.service')
const ApiSuccess = require('../utils/ApiSuccess')
const ApiError = require('../utils/ApiError')

exports.GetOverview = async (req, res, next) => {
    try {
        const warehouse = req.query.warehouse;
        const threshold = Number(req.query.threshold ?? 90);
        console.log("hihi", threshold);

        if (isNaN(threshold) || threshold < 90) {
            return res.json(ApiError.BadRequest('threshold', 'Invalid threshold value. It must be a non-negative number.'));
        }
        const [
            annualSummary,
            categorySummary,
            warehouseSummary,
            buyerRank,
            agedRank,
            monthWarehouseLedger
        ] = await Promise.all([
            StockService.AnnualSummary(warehouse),
            StockService.CategorySummary(warehouse),
            StockService.WarehouseSummary(),
            StockService.BuyerRank(warehouse),
            StockService.AgedRank(warehouse, threshold),
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
            item: req.query.item,
            warehouse: req.query.warehouse,
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 25)
        };
        const items = await StockService.detail(data);
        return res.json(ApiSuccess.getSelect('detail', items))
    } catch (error) {
        return next(error)
    }
}