const ApiError=require('../utils/ApiError');
function notFound(req,res,next){ next(ApiError.NotFound(`Không tìm thấy ${req.method} ${req.originalUrl}`)); }
function errorHandler(err,req,res,next){
  if (res.headersSent) return next(err);
  const status=Number(err.status)||500;
  if (status>=500) console.error('[ERROR]',err);
  return res.status(status).json({success:false,message:status===500?'Internal Server Error':err.message,errors:err.errors||[]});
}
module.exports={notFound,errorHandler};
