
const ReserveServices = require("../services/Reserve.service")
const ApiSuccess = require('../utils/ApiSuccess')


exports.GetReserve = async (req, res, next) => {
    try {
        const [
            signals,
            distribution,
            oldStock,
            register
        ] = await Promise.all([
            ReserveServices.ReserveAgeSignals(),
            ReserveServices.AgeBandDistribution(),
            ReserveServices.OldStockbyBuyer(),
            ReserveServices.CrossFilteredRegister()
        ]);
        const data = {
            ...signals,
            ...distribution,
            ...oldStock,
            ...register
        };
        return res.json(ApiSuccess.getSelect('reserve', data))
    } catch (error) {
        return next(error)
    }
}