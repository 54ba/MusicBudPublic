const app = require("express")();
const router = require("express").Router();


const { errorHandler } = require("../middlewares/errorHandler");
const { NotFoundError } = require("../helpers/error");
require("dotenv").config();
const prefix = process.env.ROUTE_PREFIX || "/api/v1/";
const logger = require("morgan");

const budsRoutes = require("./buds");
const userProfileRoutes = require("./userProfile");
const chatRoutes = require("./chat");
const searchRoutes = require("./search");


if (["development", "production"].includes(process.env.NODE_ENV)) {
    app.use(logger("dev"));
}

app.use(prefix, budsRoutes);
app.use(prefix, userProfileRoutes);
app.use(prefix, chatRoutes);
app.use(prefix, searchRoutes);

app.all("*", (_, res) => {
    throw new NotFoundError("Resource not found on this server");
});

app.use(errorHandler);

module.exports = app;