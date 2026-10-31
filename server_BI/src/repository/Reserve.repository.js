const { getPool, sql } = require('../config/connectData')
const pagination = require('../utils/Pagination')


class ReseverRepository {
    async ReserveAgeSignals() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @today date = CAST(GETDATE() AS date);WITH r AS (SELECT end_usd AS usd,CASE WHEN made_lot_date IS NULL OR made_lot_date > @today THEN 0
                    WHEN DATEADD(MONTH, 3, made_lot_date) > @today THEN 1
                    WHEN DATEADD(MONTH, 6, made_lot_date) > @today THEN 2
                    WHEN DATEADD(MONTH, 9, made_lot_date) > @today THEN 3
                    WHEN DATEADD(MONTH, 12, made_lot_date) > @today THEN 4
                    ELSE 5
                END AS band
            FROM dbo.bi_stock
            WHERE st_name = N'保留仓 - Reserve Materials WH'),
        bands AS (SELECT *FROM (VALUES        (1, '< 3 months'),        (2, '3–6 months'),        (3, '6–9 months'),        (4, '9–12 months'),        (5, '12+ months')) v(id, label))SELECT
            b.label,COALESCE(SUM(r.usd), 0) AS usd,CAST(
                100.0 * COALESCE(SUM(r.usd), 0)/ NULLIF((SELECT SUM(usd) FROM r), 0)AS decimal(10, 1)) AS percent_reserve,COUNT(r.band) AS line_count,    (SELECT COALESCE(SUM(usd), 0) FROM r) AS total_reserve_usd,    (SELECT COUNT(*) FROM r) AS total_reserve_lines
        FROM bands b
        LEFT JOIN r ON r.band = b.id
        GROUP BY b.id, b.label ORDER BY b.id;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async AgeBandDistribution() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @today date = CAST(GETDATE() AS date);WITH r AS (SELECT
                        end_usd AS usd,
                        made_lot_date AS lot_date
                    FROM dbo.bi_stock
                    WHERE st_name = N'保留仓 - Reserve Materials WH'AND made_lot_date <= @today
                ),
                bands AS (SELECT *FROM (VALUES        (1, '0–1 mo',   0,  1),        (2, '1–2 mo',   1,  2),        (3, '2–3 mo',   2,  3),        (4, '3–6 mo',   3,  6),        (5, '6–9 mo',   6,  9),        (6, '9–12 mo',  9, 12),        (7, '12+ mo',  12, NULL)) v(id, label, month_from, month_to))SELECT
                    b.label,COALESCE(SUM(r.usd), 0) AS usd,    (SELECT COALESCE(SUM(usd), 0)FROM r
                        WHERE DATEADD(MONTH, 6, lot_date) <= @today
                    ) AS old_stock_usd,
                    count(r.lot_date) as lines
                FROM bands b
                LEFT JOIN r
                    ON DATEADD(MONTH, b.month_from, r.lot_date) <= @today
                AND (
                    b.month_to IS NULL OR DATEADD(MONTH, b.month_to, r.lot_date) > @today
   )GROUP BY b.id, b.label ORDER BY b.id;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    async OldStockbyBuyer() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @today date = CAST(GETDATE() AS date);WITH r AS (SELECT COALESCE(NULLIF(LTRIM(RTRIM(cust_name)), N''),N'-') AS buyer,ISNULL(end_usd, 0) AS usd
                    FROM dbo.bi_stock
                    WHERE st_name = N'保留仓 - Reserve Materials WH'AND DATEADD(MONTH, 6, made_lot_date) <= @today
                )SELECT
                    buyer,COUNT(*) AS line_count,SUM(usd) AS usd,CAST(
                        100.0 * SUM(usd) / NULLIF(SUM(SUM(usd)) OVER (), 0)AS decimal(10, 1)) AS percent_old_stock,SUM(SUM(usd)) OVER () AS total_old_stock_usd,COUNT(*) OVER () AS buyer_count
                FROM r
                GROUP BY buyer
                ORDER BY usd DESC;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }


    async CrossFilteredRegister() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @today date = CAST(GETDATE() AS date);SELECT
                    st.goods_name,
                    st.goods_type_desc,
                    st.goods_no,
                    st.made_lot,
                    st.made_lot_date AS lot_date,
                    st.cust_name AS buyer,
                    r.reason_dl,CASE WHEN st.made_lot_date IS NULL OR st.made_lot_date > @today THEN N'Unknown'WHEN DATEADD(MONTH, 3, st.made_lot_date) > @today THEN N'< 3 months'WHEN DATEADD(MONTH, 6, st.made_lot_date) > @today THEN N'3–6 months'WHEN DATEADD(MONTH, 9, st.made_lot_date) > @today THEN N'6–9 months'WHEN DATEADD(MONTH, 12, st.made_lot_date) > @today THEN N'9–12 months'ELSE N'12+ months'END AS age_band,CAST(DATEDIFF(DAY, st.made_lot_date, @today) / 30.0
                        AS decimal(10, 1)) AS age_months,

                    st.end_usd AS usd

                FROM dbo.bi_stock st
                OUTER APPLY (SELECT MAX(reason_dl) AS reason_dl
                    FROM dbo.bi_stock_reason
                    WHERE goods_no = st.goods_no
                    AND made_lot = st.made_lot
                ) r
                WHERE st.st_name = N'保留仓 - Reserve Materials WH'ORDER BY st.made_lot_date ASC, st.end_usd DESC;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
}
module.exports = new ReseverRepository()