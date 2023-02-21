"use strict";

const searchController = require("../controllers/search");
const router = require("express").Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");

router.post(
    "/search-channels-and-users",
    isLoggedIn,
    searchController.searchChannelsAndUsers
);
router.stack.forEach((l) => console.log(l.route.path, l.route.methods));

module.exports = router;