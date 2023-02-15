const express = require('express');

const router = express.Router();

const SlotController = require('../../../controllers/store/slot');

router.post('/', SlotController.addSlot);


module.exports = router;
