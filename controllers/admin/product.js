const ProductService = require('../../services/product');
const StoreService = require('../../services/store');
const CategoryService = require('../../services/category');

const ResponseService = require('../../common/response');
const HelperService = require('../../common/helper');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');

class ProductController {

    async getProducts(req, res) {

        try {
            let criteria = {};

            const type = req._userInfo._user_type;

            let pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
            let perPage = parseInt(req.query.perPage || config.pagination.perPage);

            let request = Object.assign({}, req.query);
            if (!request.store_id && type != 2) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED)

            criteria.search = request.search ? request.search : "";

            if (type == 2) criteria.store_id = req._userInfo._user_id
            else criteria.store_id = request.store_id;

            if (request.subcategory_id) criteria.subcategory_id = request.subcategory_id;
            if (request.category_id) criteria.category_id = request.category_id;
            let sort = { [req.query.name]: Number(req.query.sortType) }

            let paginationVariables = {
                pageNo: pageNo,
                perPage: perPage
            };

            let subcategories = await ProductService.getProductsWithPagination({}, pageNo, perPage, criteria, sort);
            paginationVariables.totalItems = await ProductService.getTotalProductsCount({}, criteria);

            return res.status(200).send(ResponseService.success({ subcategories, paginationVariables }));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

    async addProduct(req, res) {
        try {

            console.log('add product ...............')
            let request = Object.assign({}, req.body); //what is perpose of Object.assign

            request.price = JSON.parse(request.price)



            request.pictures = [];
            if (request.imageName) {
                request.pictures.push(request.imageName);
            }
            // product_pictures.forEach(element => {
            //     request.pictures.push(element.filename)
            // });

            const type = req._userInfo._user_type;

            if (!request.store_id && type != 2) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

            if (type == 2) request.store_id = req._userInfo._user_id;

            if (request.tags) {

                request.tags = JSON.parse(request.tags);
                for (let i = 0; i < request.tags.length; i++) {
                    request.tags[i] = request.tags[i].trim();

                    if (request.tags[i].length == 0) {
                        request.tags.splice(i, 1);
                        i--;
                    }
                }
            }

            if (request.sku_id) {

                let product = await ProductService.getProduct({ sku_id: request.sku_id, store_id: request.store_id })
                if (product) throw new apiError.ValidationError('sku_id', 'Sku ID already exists for another product.')
            }

            let priority = 0;
            // if (request.commission.store_comm != "") {

            request.commission = JSON.parse(request.commission)
            // request.store_comm = JSON.parse(request.commission.store_comm)
            // }
            let categoryId = request.category_id
            let storeId = request.store_id

            if (request.commission.store_comm > 0) {

                priority = 4

                //   let updateProduct = await ProductService.updateProduct
            } else {

                let subCategory = await CategoryService.getSubCategory(categoryId, storeId)
                let parentId = subCategory.parent._id
                if (subCategory.commission != undefined && subCategory.commission <= 0) {
                    if (subCategory.commission > 0 && subCategory.parent != null) {
                        request.commission.store_comm = subCategory.commission
                        priority = 3
                    }
                } else {
                    let mainCategory = await CategoryService.getMainCategory(parentId, storeId)
                    if (mainCategory.commission > 0 && mainCategory.parent == null) {
                        request.commission.store_comm = mainCategory.commission

                        priority = 2
                    }
                }
            }
            if (priority == 0) {
                let productStore = await StoreService.findStore(storeId)
                request.commission.store_comm = productStore.commission
                priority = 1
            }

            request.commission.store_comm_priority = priority


            // console.log("req.body ", request)
            // let product = await ProductService.addProductToStore(request);

            let product = await ProductService.addProductToStore(request)
            return res.status(200).send(ResponseService.success(product));

        } catch (e) {
            console.log(e)
            return res.status(500).send(ResponseService.failure(e));
        }

    }
    // added by me
    async updateProductStatus(req, res) {
        try {
            const request = Object.assign({}, req.body);
            const id = req.params.id;
            let product = await ProductService.getProduct({ _id: id })

            if (request.is_featured) {
                if (product.is_featured === true) {
                    let updateProduct = await ProductService.updateProduct({ _id: id }, { is_featured: false })
                } else {
                    let updateProduct = await ProductService.updateProduct({ _id: id }, { is_featured: true })

                }
            } else if (request.is_best_selling) {
                if (product.is_best_selling === true) {
                    let updateProduct = await ProductService.updateProduct({ _id: id }, { is_best_selling: false })
                } else {
                    let updateProduct = await ProductService.updateProduct({ _id: id }, { is_best_selling: true })

                }
            }


            return res.status(200).send(ResponseService.success(product));

        } catch (e) {

            return res.status(500).send(ResponseService.failure(e));
        }
    }
    async updateProduct(req, res) {
        try {
            const request = Object.assign({}, req.body);
            if (request.price) request.price = JSON.parse(request.price)
            const id = req.params.id;
            if (request.is_featured) request.is_featured = JSON.parse(request.is_featured)
            if (request.is_best_selling) request.is_best_selling = JSON.parse(request.is_best_selling)
            if (request.stock_quantity) request.stock_quantity = (JSON.parse(request.stock_quantity))
            if (request.order_max) request.order_max = (JSON.parse(request.order_max))
            if (request.status) request.status = JSON.parse(request.status)

            if (request.sku_id) {
                let product = await ProductService.getProduct({ sku_id: request.sku_id, store_id: request.store_id })
                if (product && product._id != id) throw new apiError.ValidationError('sku_id', 'Sku ID already exists for another product.')
            }

            delete request.pictures;
            delete request.created_at;
            delete request.updated_at;
            delete request._id;
            delete request.__v;
            delete request.store_id;

            if (!request.name) throw new apiError.ValidationError('product_name', messages.NAME_REQUIRED)
            if (!request.status) throw new apiError.ValidationError('product_details', messages.STATUS_REQUIRED)

            if (request.tags) {

                request.tags = JSON.parse(request.tags);
                for (let i = 0; i < request.tags.length; i++) {
                    request.tags[i] = request.tags[i].trim();

                    if (request.tags[i].length == 0) {
                        request.tags.splice(i, 1);
                        i--;
                    }

                }
            }

            request.pictures = [];
            if (request.imageName) {
                request.pictures.push(request.imageName);
            }



            if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

            let product = await ProductService.getProductById(id);

            if (!product) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

            // Added by me


            request.commission = JSON.parse(request.commission)

            let categoryId = request.category_id
            let storeId = request.storeid
            let priority = 0

            if (request.commission.store_comm > 0) {

                priority = 4

            } else {

                let subCategory = await CategoryService.getSubCategory(categoryId, storeId)
                let parentId = subCategory.parent._id
                if (subCategory.commission != undefined && subCategory.commission > 0) {
                    if (subCategory.commission > 0 && subCategory.parent != null) {
                        request.commission.store_comm = subCategory.commission
                        priority = 3
                    } else {
                        let mainCategory = await CategoryService.getMainCategory(parentId, storeId)
                        if (mainCategory.commission > 0 && mainCategory.parent == null) {
                            request.commission.store_comm = mainCategory.commission

                            priority = 2
                        }
                    }
                } else {
                    let mainCategory = await CategoryService.getMainCategory(parentId, storeId)
                    if (mainCategory.commission > 0 && mainCategory.parent == null) {
                        request.commission.store_comm = mainCategory.commission

                        priority = 2
                    }
                }
            }
            if (priority == 0) {
                let productStore = await StoreService.findStore(storeId)
                request.commission.store_comm = productStore.commission
                priority = 1
            }

            request.commission.store_comm_priority = priority

            let updatedProduct = await ProductService.updateProduct({ _id: id }, request)
            if (!updatedProduct) throw new apiError.InternalServerError();

            return res.status(200).send(ResponseService.success({ product: updatedProduct }));

        } catch (e) {
            console.log(e)
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async deleteProduct(req, res) {

        try {

            let id = req.params.id;
            if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

            const type = req._userInfo._user_type;

            let condition = {
                _id: id
            };

            if (type == 2) condition.store_id = req._userInfo._user_id;

            let product = await ProductService.getProduct(condition);
            if (!product) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

            let deletedProduct = await ProductService.deleteProduct({ _id: id });

            return res.status(200).send(ResponseService.success({ product: deletedProduct }));


        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

}

module.exports = new ProductController();