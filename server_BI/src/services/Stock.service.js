
const StockRepository = require('../repository/Stock.repository')
class StockService {
    async AnnualSummary() {
        try {
            const items = await StockRepository.AnnualSummary();
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }

    async CategorySummary() {
        try {
            const items = await StockRepository.CategorySummary();
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockService()