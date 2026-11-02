
const StockService = require('../services/Stock.service')
const ApiSuccess = require('../utils/ApiSuccess')
const ApiError = require('../utils/ApiError')

exports.GetOverview = async (req, res, next) => {
    try {
        const warehouse = req.query.warehouse;
        const year = Number(req.query.year);
        const nameZh = req.query.nameZh;
        const name = req.query.name;
        const threshold = Number(req.query.threshold ?? 90);
        const period = Number(req.query.period ?? 0);

        if (isNaN(threshold) || threshold < 60 || year < 0 || period < 0) {
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
            StockService.AnnualSummary(warehouse, year, nameZh, name, period),
            StockService.CategorySummary(warehouse, year, nameZh, name, period),
            StockService.WarehouseSummary(year, nameZh, name, period),
            StockService.BuyerRank(warehouse, year, nameZh, name, period),
            StockService.AgedRank(warehouse, threshold, year, nameZh, name, period),
            StockService.monthWarehouseLedge(warehouse, year, nameZh, name, period),
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
            year: Number(req.query.year),
            nameZh: req.query.nameZh,
            name: req.query.name,
            threshold: Number(req.query.threshold ?? 90),
            period: Number(req.query.period ?? 0),
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 25)
        };
        const items = await StockService.detail(data);
        return res.json(ApiSuccess.getSelect('detail', items))
    } catch (error) {
        return next(error)
    }
}