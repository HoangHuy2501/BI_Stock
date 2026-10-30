const jwt=require('jsonwebtoken');
const env=require('../config/env');
const ApiError=require('../utils/ApiError');
module.exports=function authenticate(req,res,next){
  const match=/^Bearer (\S+)$/i.exec(req.headers.authorization||'');
  if (!match) return next(ApiError.Unauthorized('Thiếu Bearer token'));
  try {
    const decoded=jwt.verify(match[1],env.jwtSecret,{algorithms:['HS256']});
    if (!decoded.userId) return next(ApiError.Unauthorized('Token không hợp lệ'));
    req.user=decoded; next();
  } catch(e){ next(ApiError.Unauthorized('Token không hợp lệ hoặc đã hết hạn')); }
};
