
const { getPool, sql } = require('../config/connectData')
class StockRepository {
    async AnnualSummary() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select ROW_NUMBER() OVER (ORDER BY made_lot_date) - 1 AS yearIdx, year(made_lot_date) as year, 
                    round(sum(end_usd), 0) as usd
                    from bi_stock 
                    group by year(made_lot_date)
                    order by year(made_lot_date) asc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async CategorySummary() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select ROW_NUMBER() OVER (ORDER BY effect_no) - 1 AS categoryIdx, effect_no as nameZh, 
                    round(sum(end_usd),0) as usd
                    from bi_stock
                    group by effect_no
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async WarehouseSummary() {

    }
}
module.exports = new StockRepository()
