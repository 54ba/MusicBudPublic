const { model } = require("mongoose");
const userProfileController = require("../controllers/userProfile");
const router = require("express").Router();
const { catchAsync } = require("../middlewares/catchAsync");
const { isLoggedIn } = require("../middlewares/isLoggedIn");


router.get("/login", userProfileController.login);
router.get("/refresh-token", isLoggedIn, userProfileController.refreshToken);

router.get("/callback", userProfileController.callback);

router.get(
    "/update-my-likes",
    isLoggedIn,
    userProfileController.updateUserProfile
);

router.post(
    "/set-my-bio",
    isLoggedIn,
    userProfileController.setAndUpdateUserBio
);

router.post(
    "/get-my-profile",
    isLoggedIn,
    userProfileController.getUserProfile
);
router.post(
    "/get-bud-profile",
    isLoggedIn,
    userProfileController.getBudProfile
);

router.stack.forEach((l) => console.log(l.route.path, l.route.methods));

module.exports = router;