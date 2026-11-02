
const { getPool, sql } = require('../config/connectData')
const pagination = require('../utils/Pagination')
class StockRepository {
    async AnnualSummary(warehouse, year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("warehouse", sql.NVarChar, warehouse?.trim() || null)
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh?.trim() || null)
                .input("name", sql.NVarChar, name?.trim() || null)
                .input("period", sql.Int, period || 0)
                .query(`
                select CAST(ROW_NUMBER() OVER (ORDER BY year(made_lot_date)) - 1 AS INT) AS yearIdx, year(made_lot_date) as year , 
                    round(sum(end_usd), 0) as usd
                    from bi_stock 
                    WHERE
                        (
                            @warehouse IS NULL
                            OR (
                                @warehouse = N'半成品仓 - sFG WH'
                                AND st_no IN ('106', '306')
                            )
                            OR (
                                @warehouse <> N'半成品仓 - sFG WH'
                                AND st_name LIKE N'%' + @warehouse + N'%'
                            )
                        )

                        AND (
                            @year IS NULL
                            OR YEAR(made_lot_date) = @year
                        )

                        AND (
                            @nameZh IS NULL
                            OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                        )

                        AND (
                            @name IS NULL
                            OR cust_name LIKE N'%' + @name + N'%'
                        )

                        AND (
                            @period IS NULL
                            OR @period = 0
                            OR (
                                made_lot_date >= DATEADD(
                                    MONTH, -@period, CAST(GETDATE() AS DATE)
                                )
                                AND made_lot_date < DATEADD(
                                    DAY, 1, CAST(GETDATE() AS DATE)
                                )
                            )
                        )
                    group by year(made_lot_date)
                    order by year(made_lot_date) asc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async CategorySummary(warehouse, year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("warehouse", sql.NVarChar, warehouse?.trim() || null)
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh || null)
                .input("name", sql.NVarChar, name || null)
                .input("period", sql.Int, period || 0)
                .query(`
                select CAST(ROW_NUMBER() OVER (ORDER BY goods_type_desc) - 1 AS INT) AS categoryIdx, goods_type_desc as nameZh, 
                    round(sum(end_usd),0) as usd
                    from bi_stock 
                    WHERE
                        (
                            @warehouse IS NULL
                            OR (
                                @warehouse = N'半成品仓 - sFG WH'
                                AND st_no IN ('106', '306')
                            )
                            OR (
                                @warehouse <> N'半成品仓 - sFG WH'
                                AND st_name LIKE N'%' + @warehouse + N'%'
                            )
                        )

                        AND (
                            @year IS NULL
                            OR YEAR(made_lot_date) = @year
                        )

                        AND (
                            @nameZh IS NULL
                            OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                        )

                        AND (
                            @name IS NULL
                            OR cust_name LIKE N'%' + @name + N'%'
                        )

                        AND (
                            @period = 0
                            OR (
                                made_lot_date >= DATEADD(
                                    MONTH, -@period, CAST(GETDATE() AS DATE)
                                )
                                AND made_lot_date < DATEADD(
                                    DAY, 1, CAST(GETDATE() AS DATE)
                                )
                            )
                        )
                    group by goods_type_desc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async WarehouseSummary(year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh)
                .input("name", sql.NVarChar, name)
                .input("period", sql.Int, period)
                .query(`
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
                        WHERE
                            (
                                @year IS NULL
                                OR YEAR(made_lot_date) = @year
                            )

                            AND (
                                @nameZh IS NULL
                                OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                            )

                            AND (
                                @name IS NULL
                                OR cust_name LIKE N'%' + @name + N'%'
                            )

                            AND (
                                @period = 0
                                OR (
                                    made_lot_date >= DATEADD(
                                        MONTH, -@period, CAST(GETDATE() AS DATE)
                                    )
                                    AND made_lot_date < DATEADD(
                                        DAY, 1, CAST(GETDATE() AS DATE)
                                    )
                                )
                            )
                    ) x
                    GROUP BY x.st_name
                    ORDER BY usd DESC
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async BuyerRank(warehouse, year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("warehouse", sql.NVarChar, warehouse?.trim() || null)
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh || null)
                .input("name", sql.NVarChar, name || null)
                .input("period", sql.Int, period || 0)
                .query(`
                select CAST (ROW_NUMBER() OVER (ORDER BY cust_name) - 1 AS INT) AS customerIdx,
                        isnull(cust_name, '-') AS name,
                        round(sum(end_usd),0) as usd
                        from bi_stock 
                        WHERE
                            (
                                @warehouse IS NULL
                                OR (
                                    @warehouse = N'半成品仓 - sFG WH'
                                    AND st_no IN ('106', '306')
                                )
                                OR (
                                    @warehouse <> N'半成品仓 - sFG WH'
                                    AND st_name LIKE N'%' + @warehouse + N'%'
                                )
                            )

                            AND (
                                @year IS NULL
                                OR YEAR(made_lot_date) = @year
                            )

                            AND (
                                @nameZh IS NULL
                                OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                            )

                            AND (
                                @name IS NULL
                                OR cust_name LIKE N'%' + @name + N'%'
                            )

                            AND (
                                @period = 0
                                OR (
                                    made_lot_date >= DATEADD(
                                        MONTH, -@period, CAST(GETDATE() AS DATE)
                                    )
                                    AND made_lot_date < DATEADD(
                                        DAY, 1, CAST(GETDATE() AS DATE)
                                    )
                                )
                            )
                        group by cust_name
                        order by usd desc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async AgedRank(warehouse, threshold, year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("warehouse", sql.NVarChar, warehouse?.trim() || null)
                .input("threshold", sql.Int, threshold)
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh || null)
                .input("name", sql.NVarChar, name || null)
                .input("period", sql.Int, period || 0)
                .query(`
                select CAST (ROW_NUMBER() OVER (ORDER BY goods_type_desc) - 1 AS INT) AS categoryIdx,
                    goods_type_desc as nameZh, 
                    round(sum(end_usd),0) as agedUsd
                    from bi_stock
                    WHERE
                        (
                            @threshold IS NULL
                            OR DATEDIFF(
                                DAY, made_lot_date, GETDATE()
                            ) > @threshold
                        )

                        AND (
                            @warehouse IS NULL
                            OR (
                                @warehouse = N'半成品仓 - sFG WH'
                                AND st_no IN ('106', '306')
                            )
                            OR (
                                @warehouse <> N'半成品仓 - sFG WH'
                                AND st_name LIKE N'%' + @warehouse + N'%'
                            )
                        )

                        AND (
                            @year IS NULL
                            OR YEAR(made_lot_date) = @year
                        )

                        AND (
                            @nameZh IS NULL
                            OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                        )

                        AND (
                            @name IS NULL
                            OR cust_name LIKE N'%' + @name + N'%'
                        )

                        AND (
                            @period = 0
                            OR (
                                made_lot_date >= DATEADD(
                                    MONTH, -@period, CAST(GETDATE() AS DATE)
                                )
                                AND made_lot_date < DATEADD(
                                    DAY, 1, CAST(GETDATE() AS DATE)
                                )
                            )
                        )
                    group by goods_type_desc
                    order by agedUsd desc
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async WarehouseLedger(warehouse, year, nameZh, name, period) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input("warehouse", sql.NVarChar, warehouse?.trim() || null)
                .input("year", sql.Int, year)
                .input("nameZh", sql.NVarChar, nameZh || null)
                .input("name", sql.NVarChar, name || null)
                .input("period", sql.Int, period || 0)
                .query(`
                --DECLARE @period INT = 0;
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
                    (
                        @warehouse IS NULL
                        OR (
                            @warehouse = N'半成品仓 - sFG WH'
                            AND st_no IN ('106', '306')
                        )
                        OR (
                            @warehouse <> N'半成品仓 - sFG WH'
                            AND st_name LIKE N'%' + @warehouse + N'%'
                        )
                    )

                    AND (
                        @year IS NULL
                        OR YEAR(made_lot_date) = @year
                    )

                    AND (
                        @nameZh IS NULL
                        OR goods_type_desc LIKE N'%' + @nameZh + N'%'
                    )

                    AND (
                        @name IS NULL
                        OR cust_name LIKE N'%' + @name + N'%'
                    )

                    AND (
                        @period = 0
                        OR (
                            made_lot_date >= DATEADD(
                                MONTH, -@period, CAST(GETDATE() AS DATE)
                            )
                            AND made_lot_date < DATEADD(
                                DAY, 1, CAST(GETDATE() AS DATE)
                            )
                        )
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
    // api detail
    async detail(filter = {}) {
        try {
            const {
                page,
                pageSize,
                item,
                warehouse,
                year,
                nameZh,
                name,
                period
            } = filter
            const query = `SELECT
                goods_name AS item,
                goods_no AS code,
                made_lot AS lot_batch, 
                made_lot_date AS [date],
                st_name AS warehouse,
                mo_no,
                cust_style,
                ISNULL(cust_name, '-') AS buyer,
                effect_no AS category,
                rem,
                pmc_rem,
                ISNULL(NULLIF(LTRIM(RTRIM(reason)), ''), 'Not recorded') AS reason,
                DATEDIFF(DAY, made_lot_date, CAST(GETDATE() AS DATE)) AS age_days,
                end_qty,
                end_usd,
                unit_no
            FROM bi_stock
            where 
                (
                @item IS NULL
                OR (
                    made_lot LIKE N'%' + @item + N'%'
                    OR goods_no LIKE N'%' + @item + N'%'
                    OR goods_name LIKE N'%' + @item + N'%'
                    OR cust_name LIKE N'%' + @item + N'%'
                    OR st_name LIKE N'%' + @item + N'%'
                )
            )

            AND (
                @warehouse IS NULL
                OR (
                    @warehouse = N'半成品仓 - sFG WH'
                    AND st_no IN ('106', '306')
                )
                OR (
                    @warehouse <> N'半成品仓 - sFG WH'
                    AND st_name LIKE N'%' + @warehouse + N'%'
                )
            )

            AND (
                @year IS NULL
                OR YEAR(made_lot_date) = @year
            )

            AND (
                @nameZh IS NULL
                OR goods_type_desc LIKE N'%' + @nameZh + N'%'
            )

            AND (
                @name IS NULL
                OR cust_name LIKE N'%' + @name + N'%'
            )

            AND (
                @period = 0
                OR (
                    made_lot_date >= DATEADD(
                        MONTH, -@period, CAST(GETDATE() AS DATE)
                    )
                    AND made_lot_date < DATEADD(
                        DAY, 1, CAST(GETDATE() AS DATE)
                    )
                )
            );
        `
            return pagination({
                query,
                params: {
                    item: item?.trim() || null,
                    warehouse: warehouse?.trim() || null,
                    year: year ?? null,
                    nameZh: nameZh?.trim() || null,
                    name: name?.trim() || null,
                    period: period ?? 0
                },
                page,
                pageSize,
                orderBy: "[date] DESC"
            })
        } catch (error) {
            throw error
        }
    }
}
module.exports = new StockRepository()
