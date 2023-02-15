const StoreService = require('../../services/store');
const ProductService = require('../../services/product');
const messages = require('../../common/messages');
const ResponseService = require('../../common/response');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config/constants')

class OpenApiController {

    async updateProductsFromSku(req, res) {

        try {

            if (!req.headers.authorization) throw new Error('Auth Token is Invalid.')

            const token = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken.verify(token, config.authSecretToken);

            let store_id = decoded.id;
            let store = await StoreService.getStore({ _id: store_id });
            if (!store) throw new Error(messages.STORE_ID_INVALID);

            let request = Object.assign({}, req.body);
            if (request.products.length == 0) throw new Error('Products array is empty');
            if (request.products.length > 10) throw new Error('Your Products Update Limit is 10');
            let data = await ProductService.addProductsFromSku(request.products, store_id);

            if (data.success) {

                res.send(ResponseService.success({
                    received_Products_Count: data.received_products,
                    duplicate_Products_Count: data.duplicate_products_count,
                    updated_Products_Count: data.updated_products_count,
                    not_Found_Ptoducts_Count: data.not_found_products_count,
                    not_Found_Ptoducts: data.not_found_products,
                    duplicate_Products: data.duplicate_products,
                    updated_Products: data.updated_products,
                }));

            } else {
                throw new Error(data.error)
            }


        } catch (e) {
            if (e.name == 'JsonWebTokenError') {
                return res.status(401).send({ message: 'Auth Token is Invalid.' })
            }
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }

    }
    async addNewProducts(req, res) {

        try {

            if (!req.headers.authorization) throw new Error('Auth Token is Invalid.')

            const token = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken.verify(token, config.authSecretToken);

            let store_id = decoded.id;
            let store = await StoreService.getStore({ _id: store_id });
            if (!store) throw new Error(messages.STORE_ID_INVALID);

            let request = Object.assign({}, req.body);
            if (request.products.length == 0) throw new Error('Products array is empty');
            if (request.products.length > 100) throw new Error('Your Products Update Limit is 100');
            let data = await ProductService.addNewProduct(request.products, store_id);

            if (data.success) {

                res.send(ResponseService.success({
                    received_Products_Count: data.received_products,
                    added_Products_Count: data.added_Products_Count,
                    not_Added_Products_Count: data.not_added_products_count,
                    duplicate_Products_Count: data.duplicate_products_count,
                    added_Products: data.added_Products,
                    not_Added_Products: data.not_added_products,
                    duplicate_Products: data.duplicate_products,
                }));

            } else {
                throw new Error(data.error)
            }


        } catch (e) {
            if (e.name == 'JsonWebTokenError') {
                return res.status(401).send({ message: 'Auth Token is Invalid.' })
            }
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }

    }

}


module.exports = new OpenApiController;