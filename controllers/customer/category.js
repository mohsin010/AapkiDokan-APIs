const CategoryService = require('../../services/category');
const ResponseService = require('../../common/response');
const HelperService = require('../../common/helper');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');

class CategoryController {

    async getAllStoreCategories(req, res) {

        try {

            let store_id = req.query.store_id;

            if(!store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED)
            if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('store_id', messages.ID_INVALID)

            let categories = await CategoryService.getAllCategoriesWithSubCategories(store_id);

            return res.status(200).send(ResponseService.success({categories}));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

    async getCategoryDetails (req, res) {

        try {
            let id = req.params.id;
            if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('category_id', messages.ID_INVALID);

            let category = await CategoryService.getActiveCategory(id);
            category = category.length > 0 ? category[0] : {};

            return res.status(200).send(ResponseService.success({ category }));
            
        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));            
        }
    }

}

module.exports = new CategoryController();