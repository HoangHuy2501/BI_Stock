
const StockService = require('../services/Stock.service')
const ApiSuccess = require('../utils/ApiSuccess')


exports.GetOverview = async (req, res, next) => {
    try {
        const annualSummary = await StockService.CategorySummary()
        return res.json(ApiSuccess.getSelect('overview', { annualSummary }));
    } catch (error) {
        return next(error)
    }
}
