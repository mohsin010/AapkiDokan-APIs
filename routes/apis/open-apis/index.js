const express = require('express');
const router = express.Router();

const OpenApiController = require('../../../controllers/common/open-apis');
const JwtAuth = require('../../../middlewares/jwt-auth');

// router.post('/', dsd)

router.post('/update-sku-products',JwtAuth, OpenApiController.updateProductsFromSku)
router.post('/add-products',JwtAuth,  OpenApiController.addNewProducts)

module.exports = router;

