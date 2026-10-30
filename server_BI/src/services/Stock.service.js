
const StockRepository = require('../repository/Stock.repository')
class StockService {
    async AnnualSummary() {
        try {
            const items = await StockRepository.AnnualSummary();
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.a_total
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockService()