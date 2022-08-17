const createError = (stat, msg) => {
  const err = new Error();
  err.message = msg;
  err.status = stat;
  return err;
};

module.exports = createError;
