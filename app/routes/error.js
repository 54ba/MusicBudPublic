const error404 = (req, res, next) => {
        return res.status(404).json({
            defaultResponse:
            {
                errorMessage:"404 Not found!",
                code:404,
                successful: false
            }
        });
    }
module.exports = {
    error404
}

  