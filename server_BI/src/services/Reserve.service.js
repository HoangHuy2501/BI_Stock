const ReserveRepository = require('../repository/Reserve.repository')

class ReserveServices {
    async ReserveAgeSignals() {
        try {
            const item = await ReserveRepository.ReserveAgeSignals();
            const keys = ['lt3', 'm3', 'm6', 'm9', 'gte12'];
            const data = {
                usd: item[0].total_reserve_usd,
                lines: item[0].total_reserve_lines,
                bands: item.map((row, index) => ({
                    key: keys[index],
                    usd: Number(row.usd ?? 0),
                    lines: Number(row.line_count ?? 0)
                }))
            }
            return data
        } catch (error) {
            throw error
        }
    }

    async AgeBandDistribution() {
        try {
            const items = await ReserveRepository.AgeBandDistribution();

            const bins = [
                { fromMonth: 0, toMonth: 1, bandIndex: 0 },
                { fromMonth: 1, toMonth: 2, bandIndex: 0 },
                { fromMonth: 2, toMonth: 3, bandIndex: 0 },
                { fromMonth: 3, toMonth: 6, bandIndex: 1 },
                { fromMonth: 6, toMonth: 9, bandIndex: 2 },
                { fromMonth: 9, toMonth: 12, bandIndex: 3 },
                { fromMonth: 12, toMonth: 999, bandIndex: 4 }
            ];

            const data = {
                atRiskUsd: Number(items[0]?.old_stock_usd ?? 0),

                hist: items.map((row, index) => ({
                    label: row.label,
                    fromMonth: bins[index].fromMonth,
                    toMonth: bins[index].toMonth,
                    bandIndex: bins[index].bandIndex,
                    usd: Number(row.usd ?? 0),
                    lines: Number(row.lines ?? 0)
                }))
            };

            return data;
        } catch (error) {
            throw error
        }
    }


    async OldStockbyBuyer() {
        try {
            const items = await ReserveRepository.OldStockbyBuyer();

            const data = {
                atRiskUsd: Number(items[0]?.total_old_stock_usd ?? 0),

                buyers: items.map((row, index) => ({
                    idx: index,
                    name: row.buyer,
                    usd: Number(row.usd ?? 0),
                    lines: Number(row.line_count ?? 0)
                }))
            };

            return data;
        } catch (error) {
            throw error
        }
    }
    async CrossFilteredRegister() {
        try {
            const items = await ReserveRepository.CrossFilteredRegister();

            const rows = items.map((row, index) => ({
                id: String(index + 1),

                itemName: row.goods_name ?? null,
                categoryName: row.goods_type_desc ?? null,
                goodsNo: row.goods_no ?? null,
                batchNo: row.made_lot ?? null,
                lotDate: row.lot_date ?? null,
                buyer: row.buyer ?? null,
                reasonDl: row.reason_dl ?? null,

                ageBand: row.age_band ?? null,
                ageMonths: row.age_months == null
                    ? null
                    : Number(row.age_months),

                usd: Number(row.usd ?? 0)
            }));

            return { rows };
        } catch (error) {
            throw error
        }
    }
}

module.exports = new ReserveServices()