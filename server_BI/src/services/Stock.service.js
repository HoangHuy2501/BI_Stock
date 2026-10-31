
const StockRepository = require('../repository/Stock.repository')
class StockService {
    async AnnualSummary(warehouse) {
        try {
            const items = await StockRepository.AnnualSummary(warehouse);
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }

    async CategorySummary(warehouse) {
        try {
            const items = await StockRepository.CategorySummary(warehouse);
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }
    async WarehouseSummary() {
        try {
            const items = await StockRepository.WarehouseSummary();
            return { items }
        } catch (error) {
            throw error
        }
    }
    async BuyerRank(warehouse) {
        try {
            const items = await StockRepository.BuyerRank(warehouse);
            return { items }
        } catch (error) {
            throw error
        }
    }
    async AgedRank(warehouse) {
        try {

            const items = await StockRepository.AgedRank(warehouse);
            const thresholdDays = 90;
            return { thresholdDays, items }
        } catch (error) {
            throw error
        }
    }
    async monthWarehouseLedge() {
        try {

            const items = await StockRepository.WarehouseLedger();
            return items;
        } catch (error) {
            throw error
        }
    }
    // api detail
    async detail(data) {
        try {
            const items = await StockRepository.detail(data);
            return items
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockService()