require("dotenv").config();

const debug = require("morgan");

const DEBUG = debug("dev");

const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  let errorMessage = {};

  if (res.headersSent) {
    return next(err);
  }

  // if (!isProduction) {

  //     DEBUG(err.stack);
  //   }
  errorMessage = err;

  return res.status(err.statusCode || 500).json({
    default_response: {
      status: err.statusCode,
      successful: false,
      error: {
        message: err.message,
        ...(err.errors && { errors: err.errors }),
        ...(!isProduction && { trace: errorMessage }),
      },
    },
  });
};
module.exports = {
  errorHandler,
};
