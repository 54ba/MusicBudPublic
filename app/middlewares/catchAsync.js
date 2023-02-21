const catchAsync = (catchAsync) => async (req, res, next) => {
  try {
    await catchAsync(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  catchAsync,
};
