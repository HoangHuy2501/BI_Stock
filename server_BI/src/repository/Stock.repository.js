
const { getPool, sql } = require('../config/connectData')
class StockRepository {
    async AnnualSummary() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select CAST(ROW_NUMBER() OVER (ORDER BY year(made_lot_date)) - 1 AS INT) AS yearIdx, year(made_lot_date) as year , 
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
                select CAST(ROW_NUMBER() OVER (ORDER BY effect_no) - 1 AS INT) AS categoryIdx, effect_no as nameZh, 
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
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                SELECT
                    CAST( ROW_NUMBER() OVER (ORDER BY x.st_name) - 1 AS INT) AS warehouseIdx,
                        x.st_name as nameZh,
                        ROUND(SUM(x.end_usd), 0) AS usd
                    FROM (
                        SELECT
                            CASE
                                WHEN st_no IN ('106', '306') THEN N'半成品仓 - sFG WH'
                                ELSE st_name
                            END AS st_name,
                            end_usd
                        FROM bi_stock
                    ) x
                    GROUP BY x.st_name
                    ORDER BY usd DESC
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async BuyerRank() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select CAST (ROW_NUMBER() OVER (ORDER BY cust_name) - 1 AS INT) AS customerIdx,
                        isnull(cust_name, '-') AS name,
                        round(sum(end_usd),0) as usd
                        from bi_stock
                        group by cust_name
                        order by usd desc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async AgedRank() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                select CAST (ROW_NUMBER() OVER (ORDER BY effect_no) - 1 AS INT) AS categoryIdx,
                    effect_no as nameZh, 
                    round(sum(end_usd),0) as agedUsd
                    from bi_stock
                    where datediff(day, made_lot_date, GETDATE()) > 90
                    group by effect_no
                    order by agedUsd desc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async WarehouseLedger() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @period INT = 0;
                -- 6  = 6 tháng gần nhất
                -- 12 = 12 tháng gần nhất
                -- 0  = Tất cả

                SELECT
                    st_name as warehouseName,
                    effect_no as categoryName,
                    ISNULL(cust_name, '-') AS customerName,
                    FORMAT(made_lot_date, 'yyyy-MM') AS 'month',
                    SUM(end_qty) AS qty,
                    ROUND(SUM(end_usd), 0) AS usd
                FROM bi_stock
                WHERE
                    @period = 0
                    OR (
                        made_lot_date >= DATEADD(MONTH, -@period, CAST(GETDATE() AS DATE))
                        AND made_lot_date < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
                    )
                GROUP BY
                    st_name,
                    effect_no,
                    ISNULL(cust_name, '-'),
                    FORMAT(made_lot_date, 'yyyy-MM')
                ORDER BY
                    'month' DESC,
                    st_name,
                    effect_no,
                    customerName;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockRepository()
