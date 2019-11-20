

module.exports = async (obj, statusCode = 200)=> {

  return {
    statusCode: statusCode,
    body: JSON.stringify(obj,
      null,
      2
    ),
  };
  
};
