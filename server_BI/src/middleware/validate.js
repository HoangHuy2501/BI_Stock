const ApiError=require('../utils/ApiError');
module.exports=(validator)=>(req,res,next)=>{const errors=validator(req.body);return errors.length ? next(ApiError.BadRequest('Dữ liệu không hợp lệ',errors)) : next();};
