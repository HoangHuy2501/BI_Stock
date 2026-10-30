class ApiError extends Error {
  constructor(status, message, errors=[]) { super(message); this.status=status; this.errors=errors; }
  static BadRequest(message='Bad Request', errors=[]) { return new ApiError(400,message,errors); }
  static Unauthorized(message='Unauthorized') { return new ApiError(401,message); }
  static Forbidden(message='Forbidden') { return new ApiError(403,message); }
  static NotFound(message='Not Found') { return new ApiError(404,message); }
  static Conflict(message='Conflict') { return new ApiError(409,message); }
}
module.exports=ApiError;
