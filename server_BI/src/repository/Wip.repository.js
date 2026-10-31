
const { getPool, sql } = require('../config/connectData')
const pagination = require('../utils/Pagination')

class WipRepository {
    async WIPSignalLights() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                WITH w AS (
                    SELECT end_usd AS usd,end_qty,
                        CASE
                            WHEN DATEDIFF(DAY, made_lot_date, GETDATE()) BETWEEN 0 AND 14 THEN 'Green'
                            WHEN DATEDIFF(DAY, made_lot_date, GETDATE()) BETWEEN 15 AND 21 THEN 'Yellow'
                            WHEN DATEDIFF(DAY, made_lot_date, GETDATE()) BETWEEN 22 AND 28 THEN 'Orange'
                            WHEN DATEDIFF(DAY, made_lot_date, GETDATE()) >= 29 THEN 'Red'
                            ELSE 'Unknown'
                        END AS color
                    FROM dbo.bi_stock
                    WHERE st_name = N'WIP'
                )
                SELECT
                    color,
                    SUM(usd) AS usd,
                    SUM(end_qty) AS qty,
                    COUNT(*) AS lines,
                    CAST(
                        100.0 * SUM(usd) / NULLIF((SELECT SUM(usd) FROM w), 0)
                        AS decimal(10,1)
                    ) AS percent_wip,
                    (SELECT COALESCE(SUM(usd), 0) FROM w) AS total_wip_usd,
                    (SELECT COUNT(*) FROM w) AS total_wip_lines
                FROM w
                WHERE color <> 'Unknown'
                GROUP BY color
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async TimeonLine() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                DECLARE @today DATE = CAST(GETDATE() AS DATE);
                ;WITH bands AS (SELECT *FROM (VALUES (1, N'0–1 wk',  0,  7,    N'green'), (2, N'1–2 wk',  8,  14, N'green'),  (3, N'2–3 wk',  15, 21,   N'yellow'),        (4, N'3–4 wk',  22, 28,   N'orange'),        (5, N'4–6 wk',  29, 42,   N'red'),        (6, N'6–8 wk',  43, 56,   N'red'),        (7, N'8–12 wk', 57, 84,   N'red'),        (8, N'12 wk +', 85, NULL, N'red')) AS v(sort_order, week_band, min_days, max_days, color)),
                wip AS (SELECT DATEDIFF(DAY, made_lot_date, @today) AS age_days,
                        end_usd AS usd
                    FROM dbo.bi_stock
                    WHERE st_name = N'WIP'AND made_lot_date IS NOT NULL AND made_lot_date < DATEADD(DAY, 1, @today))SELECT
                    b.sort_order,
                    b.week_band,
                    b.color,
                    CAST(
                        COALESCE(SUM(w.usd), 0)
                        AS DECIMAL(18,3)
                    ) AS total_usd,
                    count(*) as lines
                FROM bands AS b
                LEFT JOIN wip AS w
                    ON w.age_days >= b.min_days
                AND (b.max_days IS NULL OR w.age_days <= b.max_days)GROUP BY
                    b.sort_order,
                    b.week_band,
                    b.color
                ORDER BY
                    b.sort_order;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    async RedByBuyer() {
        try {
            const pool = await getPool();
            const result = await pool.request().query(`
                WITH red AS (SELECT COALESCE(NULLIF(LTRIM(RTRIM(cust_name)), N''),N'Other / unbranded') AS buyer,
                ISNULL(end_usd, 0) AS usd
                FROM dbo.bi_stock
                WHERE st_name = N'WIP'AND DATEDIFF(DAY, made_lot_date, GETDATE()) >= 29
            )SELECT
                buyer,
                COUNT(*) AS line_count,
                CAST(SUM(usd) AS DECIMAL(18,3) )AS usd,
                CAST(
                100.0 * SUM(usd) / NULLIF(SUM(SUM(usd)) OVER (), 0)AS decimal(10, 1)) AS percent_red,
                CAST (SUM(SUM(usd)) OVER () AS DECIMAL(18,3)) AS total_red_usd
            FROM red
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
                SELECT
                    DATEDIFF(DAY, s.made_lot_date, GETDATE()) AS days,
                    s.made_lot_date AS lot_date,
                    s.goods_no,
                    s.goods_name,
                    s.mo_no,
                    s.made_lot,
                    COALESCE(
                        NULLIF(LTRIM(RTRIM(s.cust_name)), N''),
                        N'-'
                    ) AS buyer,
                    s.end_qty AS qty,
                    s.unit_no AS unit,
                    s.end_usd AS usd,
                    r.reason_dl
                FROM dbo.bi_stock AS s
                LEFT JOIN dbo.bi_stock_reason AS r
                    ON r.goods_no = s.goods_no
                AND r.mo_no = s.mo_no
                WHERE s.st_name = N'WIP'
                AND DATEDIFF(DAY, s.made_lot_date, GETDATE()) >= 29

                -- Theo Oldest first:
                ORDER BY days DESC, usd DESC;
                `)
            return result.recordset;
        } catch (error) {
            throw error
        }
    }

    // update reason
    async UpdateReason(data) {
        try {
            const {
                made_lot,
                mo_no,
                goods_no,
                reason_dl
            } = data;
            const pool = await getPool();
            const result = await pool.request()
                .input('goods_no', sql.NVarChar, goods_no)
                .input('made_lot', sql.NVarChar, made_lot ?? null)
                .input('mo_no', sql.NVarChar, mo_no)
                .input('reason_dl', sql.NVarChar, reason_dl)
                .query(`
                --Khi người dùng chọn nguyên nhân
            SET XACT_ABORT ON;

            BEGIN TRY
                BEGIN TRANSACTION;

                UPDATE dbo.bi_stock_reason WITH (UPDLOCK, HOLDLOCK)
                SET reason_dl = @reason_dl,
                    updated_at = GETDATE()
                WHERE goods_no = @goods_no
                AND (
                    (@made_lot IS NOT NULL AND made_lot = @made_lot)
                    OR
                    (@made_lot IS NULL AND made_lot IS NULL AND mo_no = @mo_no)
                );

                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO dbo.bi_stock_reason
                        (goods_no, made_lot, mo_no, reason_dl, is_mark, updated_at)
                    VALUES
                        (@goods_no, @made_lot, @mo_no, @reason_dl, 0, GETDATE());
                END;

                COMMIT TRANSACTION;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0
                    ROLLBACK TRANSACTION;

                THROW;
            END CATCH;

                `)
            return result.rowsAffected;
        } catch (error) {
            throw error
        }
    }
}
module.exports = new WipRepository()