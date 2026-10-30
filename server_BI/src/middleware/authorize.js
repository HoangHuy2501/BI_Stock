const ApiError=require('../utils/ApiError');
module.exports=(roles=[]) => (req,res,next) => {
 if (!req.user) return next(ApiError.Unauthorized());
 if (!roles.includes(req.user.role)) return next(ApiError.Forbidden('Không đủ quyền'));
 next();
};
