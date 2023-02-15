const ProductService = require('../../services/product');
const StoreService = require('../../services/store');
const ResponseService = require('../../common/response');
const HelperService = require('../../common/helper');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');

class ProductController {

    async getProducts(req, res) {

        try {

            let criteria = {};

            let request = Object.assign({}, req.query);

            if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED)

            criteria.search = request.search ? request.search : "";
            criteria.store_id = request.store_id;
            let perPage = parseInt(req.query.perPage || config.pagination.perPage);
            let pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
            criteria.perPage = perPage;
            criteria.pageNo = pageNo;



            if (request.subcategory_id) criteria.subcategory_id = request.subcategory_id;
            if (request.category_id) criteria.category_id = request.category_id;
 

            if (request.category_id) {
                let subcategories = await ProductService.getProducts(criteria);
                return res.status(200).send(ResponseService.success({ subcategories }));

            } else {
                let products = await ProductService.getProducts(criteria);
                return res.status(200).send(ResponseService.success({ products }));
            }

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }


    async checkProductAvailability(req, res) {

        try {

            let request = Object.assign({}, req.body);

            if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

            let store = await StoreService.getStore({ _id: request.store_id });
            if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

            if (!request.products || request.products.length == 0) throw new apiError.ValidationError('products', messages.PRODUCTS_REQUIRED);


            let invalidQuantityProducts = [];

            for (let i = 0; i < request.products.length; i++) {

                let product = request.products[i];

                if (!product._id) throw new apiError.ValidationError('product_id', messages.PRODUCT_ID_REQUIRED);
                if (!product.count) throw new apiError.ValidationError('product_count', messages.COUNT_REQUIRED);
                if (product.count <= 0) throw new apiError.ValidationError('product_count', messages.COUNT_GREATER_THAN_0);

                if (!HelperService.isValidMongoId(product._id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

                let productDetail = await ProductService.getProduct({ _id: product._id, store_id: request.store_id });
                if (!productDetail) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

                if (product.count > productDetail.stock_quantity) {

                    invalidQuantityProducts.push({
                        _id: product._id,
                        stock_quantity: productDetail.stock_quantity,
                        quantity_ordered: product.count
                    })

                }

            }
            let message = '';
            if (invalidQuantityProducts.length == 0) message = 'All Products Are Available';
            else message = 'Some Products Are Not Available Right Now'

            res.send(ResponseService.success({ message: message, outOfStockProducts: invalidQuantityProducts }))

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));

        }
    }

}

module.exports = new ProductController();