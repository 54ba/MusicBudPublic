const apoc = require("apoc");
require("dotenv").config();

const isLoggedIn = async(req, res, next) => {
    const authHeader = req.headers["authorization"];
    const access_token = authHeader && authHeader.split(" ")[0];
    try {

        if (!access_token) {
            return res.status(401).json({
                defaultResponse: {
                    message: "access token not provided",
                    code: 401,
                    successful: false,
                },
            });
        }


        let query = `match ( user:USER{access_token:'${access_token}'}) return user`;
        const result = await apoc.query(query).exec();
        const user = getData(result, "user");


        if (
            new Date().getTime() / 1000 + user.expires_in <=
            new Date().getTime() / 1000
        ) {
            return res.status(401).json({
                defaultResponse: {
                    message: "access token expired",
                    code: 401,
                    successful: false,
                },
            });
        }

        req.user = getData(result, "user");
        return next();
    } catch (error) {
        console.log(error);
    }
};

const getData = (queryResult, variable) => {
    Index = queryResult[0].columns.indexOf(variable);
    return queryResult[0].data[0].row[Index];
};

module.exports = {
    isLoggedIn,
};