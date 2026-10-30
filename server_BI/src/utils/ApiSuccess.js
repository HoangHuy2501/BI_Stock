module.exports = {
  getSelect: (message,data) => ({success:true,message,data}),
  created: (message,data) => ({success:true,message,data}),
  updated: (message,data) => ({success:true,message,data}),
  deleted: (message) => ({success:true,message})
};
