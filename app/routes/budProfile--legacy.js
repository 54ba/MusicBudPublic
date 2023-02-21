
const router = require('express').Router();   
const budProfileController = require('../controllers/budProfile');

module.exports = ()=> {
        router.get('/get-bud-profile', budProfileController.getBudProfile());
        router.stack.forEach(l => console.log(l.route.path, l.route.methods))
        return router;
    }
    