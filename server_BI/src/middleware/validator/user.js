const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateRegister(data){const errors=[];
 if(typeof data.name!=='string'||!data.name.trim()||data.name.length>100) errors.push({field:'name',message:'name bắt buộc, tối đa 100 ký tự'});
 if(typeof data.email!=='string'||!email.test(data.email)) errors.push({field:'email',message:'Email không hợp lệ'});
 if(typeof data.password!=='string'||data.password.length<8) errors.push({field:'password',message:'Password tối thiểu 8 ký tự'});
 return errors;
}
function validateLogin(data){return (!data.email||!data.password) ? [{field:'credentials',message:'Cần email và password'}] : [];}
function validateUpdate(data){return (typeof data.name!=='string'||!data.name.trim()||data.name.length>100) ? [{field:'name',message:'name bắt buộc, tối đa 100 ký tự'}] : [];}
module.exports={validateRegister,validateLogin,validateUpdate};
