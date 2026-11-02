
const StockRepository = require('../repository/Stock.repository')
class StockService {
    async AnnualSummary(warehouse, year, nameZh, name, period) {
        try {
            const items = await StockRepository.AnnualSummary(warehouse, year, nameZh, name, period);
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }

    async CategorySummary(warehouse, year, nameZh, name, period) {
        try {
            const items = await StockRepository.CategorySummary(warehouse, year, nameZh, name, period);
            let totalUsd = 0
            items.forEach(element => {
                totalUsd += element.usd
            });
            return { items, totalUsd }
        } catch (error) {
            throw error
        }
    }
    async WarehouseSummary(year, nameZh, name, period) {
        try {
            const items = await StockRepository.WarehouseSummary(year, nameZh, name, period);
            return { items }
        } catch (error) {
            throw error
        }
    }
    async BuyerRank(warehouse, year, nameZh, name, period) {
        try {
            const items = await StockRepository.BuyerRank(warehouse, year, nameZh, name, period);
            return { items }
        } catch (error) {
            throw error
        }
    }
    async AgedRank(warehouse, threshold, year, nameZh, name, period) {
        try {

            const items = await StockRepository.AgedRank(warehouse, threshold, year, nameZh, name, period);
            return { threshold, items }
        } catch (error) {
            throw error
        }
    }
    async monthWarehouseLedge(warehouse, year, nameZh, name, period) {
        try {
            const items = await StockRepository.WarehouseLedger(warehouse, year, nameZh, name, period);
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