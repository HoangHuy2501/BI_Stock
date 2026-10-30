
const { getPool, sql } = require("../config/connectData");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 500;

function positiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    const n = Number(value);

    if (!Number.isSafeInteger(n) || n < 1) {
        throw new Error("Invalid pagination number");
    }

    return Math.min(n, max);
}

function bindParams(request, params = {}) {
    for (const [key, value] of Object.entries(params)) {
        const name = key.replace(/^@/, "");

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw new Error(`Invalid SQL parameter: ${key}`);
        }

        if (["__pgOffset", "__pgLimit"].includes(name)) {
            throw new Error(`Reserved parameter: ${name}`);
        }

        // Support explicit SQL types when necessary
        if (
            value &&
            typeof value === "object" &&
            Object.prototype.hasOwnProperty.call(value, "type") &&
            Object.prototype.hasOwnProperty.call(value, "value")
        ) {
            request.input(name, value.type, value.value);
        } else {
            request.input(name, value === undefined ? null : value);
        }
    }

    return request;
}

function normalizeQuery(query) {
    if (typeof query !== "string" || !query.trim()) {
        throw new Error("SQL query is required");
    }

    return query.trim().replace(/;+\s*$/, "");
}

/**
 * Paginate a trusted SQL Server SELECT statement.
 *
 * query: SELECT without top-level ORDER BY
 * orderBy: trusted SQL expression for the outer query
 * params: named SQL parameters
 */
async function pagination({
    query,
    params = {},
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    orderBy = "(SELECT NULL)",
    count = true,
    pool: providedPool,
} = {}) {
    const currentPage = positiveInt(page, DEFAULT_PAGE);
    const limit = positiveInt(
        pageSize,
        DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
    );

    const offset = (currentPage - 1) * limit;

    if (!Number.isSafeInteger(offset)) {
        throw new Error("Pagination offset is too large");
    }

    const baseQuery = normalizeQuery(query);

    if (typeof orderBy !== "string" || !orderBy.trim()) {
        throw new Error("orderBy must be a non-empty SQL expression");
    }

    const pool = providedPool || await getPool();

    // Wrap original SELECT so filters, joins and grouping remain intact.
    const fromQuery = `(${baseQuery}) AS pg_source`;

    const dataSql = `
    SELECT *
    FROM ${fromQuery}
    ORDER BY ${orderBy}
    OFFSET @__pgOffset ROWS
    FETCH NEXT @__pgLimit ROWS ONLY
  `;

    const dataRequest = bindParams(pool.request(), params);

    dataRequest.input("__pgOffset", sql.BigInt, offset);
    dataRequest.input("__pgLimit", sql.Int, limit);

    let totalItems = null;

    if (count) {
        const countSql = `
      SELECT COUNT_BIG(*) AS totalItems
      FROM ${fromQuery}
    `;

        const countRequest = bindParams(pool.request(), params);
        const countResult = await countRequest.query(countSql);

        totalItems = Number(countResult.recordset[0].totalItems);

        if (!Number.isSafeInteger(totalItems)) {
            throw new Error("Total count exceeds safe JS integer range");
        }
    }

    const dataResult = await dataRequest.query(dataSql);

    return {
        data: dataResult.recordset || [],
        pagination: {
            page: currentPage,
            pageSize: limit,
            totalItems,
            totalPages: totalItems === null
                ? null
                : Math.ceil(totalItems / limit),
            hasNextPage: totalItems === null
                ? dataResult.recordset.length === limit
                : currentPage * limit < totalItems,
            hasPreviousPage: currentPage > 1,
        },
    };
}

module.exports = pagination;
