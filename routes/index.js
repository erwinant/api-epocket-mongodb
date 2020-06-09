const express = require('express');

const { Router } = express;
const router = new Router();

const user = require('./user');
const menu = require('./menu');
const profile = require('./profile');

router.use('/api/user', user);
router.use('/api/menu', menu);
router.use('/api/profile', profile);

module.exports = router;