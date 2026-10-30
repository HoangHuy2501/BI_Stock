
const { getPool, sql } = require('../config/connectData')
class StockRepository {
    async AnnualSummary() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select year(made_lot_date) as year, 
                    round(sum(end_usd), 0) as a_total
                    from bi_stock 
                    group by year(made_lot_date)
                    order by year(made_lot_date) asc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockRepository()
