const WipRepository = require("../repository/Wip.repository")

class WipServices {

    async WIPSignalLights() {
        try {
            const items = await WipRepository.WIPSignalLights();

            const lights = [
                { usd: 0, qty: 0, lines: 0 }, // Green
                { usd: 0, qty: 0, lines: 0 }, // Yellow
                { usd: 0, qty: 0, lines: 0 }, // Orange
                { usd: 0, qty: 0, lines: 0 }  // Red
            ];

            const usd = Number(items[0]?.total_wip_usd ?? 0);
            const lines = Number(items[0]?.total_wip_lines ?? 0);

            items.forEach(item => {
                const color = item.color?.trim().toLowerCase();

                let index;

                if (color === 'green') {
                    index = 0;
                } else if (color === 'yellow') {
                    index = 1;
                } else if (color === 'orange') {
                    index = 2;
                } else if (color === 'red') {
                    index = 3;
                } else {
                    return;
                }

                lights[index] = {
                    usd: Number(item.usd ?? 0),
                    qty: Number(item.qty ?? 0),
                    lines: Number(item.lines ?? 0)
                };
            });
            return { usd, lines, lights }
        } catch (error) {
            throw error
        }
    }

    async TimeonLine() {
        try {
            const items = await WipRepository.TimeonLine();
            const weeks = items.map(item => {
                const color = item.color?.trim().toLowerCase();
                const byLight = [0, 0, 0, 0];
                const usd = Number(item.total_usd ?? 0);

                if (color === 'green') {
                    byLight[0] = usd;
                } else if (color === 'yellow') {
                    byLight[1] = usd;
                } else if (color === 'orange') {
                    byLight[2] = usd;
                } else if (color === 'red') {
                    byLight[3] = usd;
                }

                return {
                    label: item.week_band,
                    usd,
                    lines: Number(item.lines ?? 0),
                    byLight
                };
            });

            return weeks;

        } catch (error) {
            throw error
        }
    }

    async RedByBuyer() {
        try {
            const items = await WipRepository.RedByBuyer();

            const customers = [];
            const custLight = [];

            const redUsd = Number(items[0]?.total_red_usd ?? 0);

            items.forEach((item, index) => {
                customers.push(item.buyer);

                custLight.push([
                    index,
                    3,
                    Number(item.usd ?? 0),
                    Number(item.line_count ?? 0)
                ]);
            });

            return {
                redUsd,
                customers,
                custLight
            };
        } catch (error) {
            throw error
        }
    }
    async CrossFilteredRegister(customers) {
        try {
            const items = await WipRepository.CrossFilteredRegister();
            const lots = items.map((item, index) => {
                const customerName = item.buyer ?? 'Other / unbranded';

                return {
                    id: `${item.goods_no}-${item.batch_no ?? ''}-${item.mo_no ?? ''}-${index}`,

                    goodsNo: item.goods_no ?? '',
                    itemName: item.goods_name ?? '',

                    customerIdx: customers.indexOf(customerName),
                    customerName,

                    qty: Number(item.qty ?? 0),
                    unit: item.unit ?? '',

                    usd: Number(item.usd ?? 0),
                    days: Number(item.days ?? 0),

                    batchNo: item.batch_no ?? '',
                    lotDate: item.lot_date
                        ? new Date(item.lot_date).toISOString().slice(0, 10)
                        : '',

                    cause: null,
                    blueFlag: false,

                    moNo: item.mo_no ?? null,
                    made_lot: item.made_lot ?? null
                };
            });

            return lots;
        } catch (error) {
            throw error
        }
    }

    // update reason
    async UpdateReason(data) {
        try {
            const result = await WipRepository.UpdateReason(data);
            return result
        } catch (error) {
            throw error
        }
    }
}
module.exports = new WipServices()