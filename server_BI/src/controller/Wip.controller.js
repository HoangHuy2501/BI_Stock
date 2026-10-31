const WipService = require('../services/Wip.service')
const ApiSuccess = require('../utils/ApiSuccess')
const ApiError = require('../utils/ApiError')
exports.GetWip = async (req, res, next) => {
    try {
        const [light, weeks, buyer] = await Promise.all([
            WipService.WIPSignalLights(),
            WipService.TimeonLine(),
            WipService.RedByBuyer(),

        ])
        const lots = await WipService.CrossFilteredRegister(buyer.customers)
        const redLines = buyer.custLight.reduce(
            (total, item) => total + item[3],
            0
        );

        const summary = {
            storeIdx: 0,
            usd: light.usd,
            qty: light.qty ?? 0,
            lines: light.lines,
            oldest: 0,

            redUsd: buyer.redUsd,
            redLines,

            registerUsd: buyer.redUsd,
            registerLines: redLines,

            lights: light.lights,
            weeks: weeks,
            catLight: [],
            custLight: buyer.custLight
        };

        const data = {
            summary,
            customers: buyer.customers,
            lots
        };
        return res.json(ApiSuccess.getSelect('wip', data))
    } catch (error) {
        return next(error)
    }
}

// api update  người dùng chọn nguyên nhân
exports.UpdateReason = async (req, res, next) => {
    try {
        const data = {
            goods_no: req.body.goodsNo,
            made_lot: req.body.made_lot || "",
            mo_no: req.body.moNo,
            reason_dl: req.body.reason,
        }
        if (!data.goods_no || !data.mo_no || !data.reason_dl) {
            throw ApiError.NotFound("not found data goodNo or moNo or reasonDl")
        }
        const result = await WipService.UpdateReason(data);
        return res.json(ApiSuccess.updated("update reason", data))
    } catch (error) {
        return next(error)
    }
}