const mongoose = require('mongoose');
const HelperService = require('../../common/helper');
const CategoryService = require('../../services/category');
const ResponseService = require('../../common/response');
const ProductService = require('../../services/product'); //added by me
const StoreService = require('../../services/store'); //added by me
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');

class CategoryController {
  async addCategory(req, res) {
    try {
      const request = { ...req.body };

      if (!request.name) throw new apiError.ValidationError('owner_details', messages.NAME_REQUIRED);
      if (!request.status) throw new apiError.ValidationError('owner_details', messages.STATUS_REQUIRED);

      const type = req._userInfo._user_type;
      console.log('type', type);

      if (type != 2 && !request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

      if (type == 2) {
        request.store_id = req._userInfo._user_id;
      }

      if (request.parent) {
        delete request.picture;
      } else {
        if (!req.files.length > 0) throw new apiError.ValidationError('picture', messages.CATEGORY_PICTURE_REQUIRED);

        const category_picture = req.files.filter((ele) => ele.fieldname === 'picture');
        request.picture = category_picture[0].filename;
      }

      let categoryExist;
      if (!request.parent) { categoryExist = await CategoryService.findCategoryByName({ store_id: request.store_id, name: request.name.trim(), parent: null }); } else if (request.parent) { categoryExist = await CategoryService.findCategoryByName({ store_id: request.store_id, name: request.name.trim(), parent: request.parent }); }

      if (categoryExist) {
        return res.status(302).send(ResponseService.failure({ code: 302, message: 'category/subcategory exist', name: 'category/subcategory add' }));
      }

      const category = await CategoryService.addCategory(request);

      return res.status(200).send(ResponseService.success(category));
    } catch (e) {
      return res.status(e.code).send(ResponseService.failure(e));
    }
  }

  async updateCategory(req, res) {
    try {
      const request = { ...req.body };

      const type = req._userInfo._user_type;

      if (type == 2) {
        if (req._userInfo._user_id != request.store_id) throw new apiError.UnauthorizedError(messages.STORE_CATEGORY_MISMATCH);
      }

      delete request._id;
      delete request.subcategories;
      delete request.store_id;

      if (!request.name) throw new apiError.ValidationError('owner_details', messages.NAME_REQUIRED);
      if (!request.status) throw new apiError.ValidationError('owner_details', messages.STATUS_REQUIRED);

      if (req.files.length > 0) {
        const category_picture = req.files.filter((ele) => ele.fieldname === 'picture');
        request.picture = category_picture[0].filename;
      }

      const { id } = req.params;

      if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('category_id', messages.ID_INVALID);

      const condition = {
        _id: id
      };

      if (type == 2) condition.store_id = req._userInfo._user_id;

      const category = await CategoryService.getOnlyCategory(condition);
      if (!category) throw new apiError.ValidationError('category_id', messages.ID_INVALID);
      let updatedCategory = await CategoryService.updateCategory(request, { _id: id })

      // added by me
      // let newUpdatedCategory = JSON.parse(updatedCategory.parent);
      let priority = 4
      let commission = 0

      if (updatedCategory.parent != null && updatedCategory.commission > 0) {
        priority = 3
        commission = updatedCategory.commission
      } else if (updatedCategory.parent != null && updatedCategory.commission == 0) {
        let condition = {
          _id: updatedCategory.parent
        }
        console.log(condition);
        // let storeId = updatedCategory.store_id.toString()
        var mainCat = await CategoryService.getOnlyCategory(condition);
        if (mainCat.commission > 0) {
          priority = 2
          commission = mainCat.commission
        } else {
          priority = 1
          let storeId = updatedCategory.store_id
          let store = await StoreService.findStore(storeId)
          commission = store.commission
        }
      } else if (updatedCategory.parent == null) {
        if (updatedCategory.commission > 0) {
          priority = 2
          commission = updatedCategory.commission
        } else {
          priority = 1
          let storeId = updatedCategory.store_id
          let store = await StoreService.findStore(storeId)
          commission = store.commission
        }


      }
      // else {
      //     priority = 1
      //     storeId = updatedCategory.store_id
      //     let store = await StoreService.findStore(storeId)
      //     commission = store.commission
      // }

      let details = {
        commission: {
          store_comm: commission,
          store_comm_priority: priority
        }
      }

      // if (category.commission != updatedCategory.commission) {
      if (priority != 1) {
        if (priority == 2) {
          if (updatedCategory.parent != null) {
            // let condition = {
            //     _id: updatedCategory.parent
            // }
            // var mainCat = await CategoryService.getOnlyCategory(condition);
            // let store_id = mainCat.store_id
            // let mainCatId = mainCat.id
            // let subCat = await CategoryService.getCategories(store_id, mainCatId)
            // subCat.forEach(cat => {
            //     let subCatId = cat.id
            let updateCondition = {
              category_id: updatedCategory,

            }
            let updateProducts = ProductService.updateProductsByCategory(details, updateCondition)
            // });
          } else { 
            // let condition = {
            //     _id: updatedCategory.parent
            // }
            // var mainCat = await CategoryService.getOnlyCategory(condition);
            // if (mainCat.commission)
            // let subCatCondition = {
            let store_id = updatedCategory.store_id
            let mainCatId = updatedCategory.id
            // }
            let subCat = await CategoryService.getCategories(store_id, mainCatId)
            subCat.forEach(cat => {
              let subCatId = cat.id
              let updateCondition = {
                category_id: subCatId,

              }
              let updateProducts = ProductService.updateProductsByCategory(details, updateCondition)
            });
          }

        }
        if (priority == 3) {

          let condition = {
            category_id: updatedCategory.id
          }
          let updateProducts = await ProductService.updateProductsByCategory(details, condition)
          console.log("updated Products Successfully" + updateProducts);
        }


      }
      if (priority == 1) {
        if (updatedCategory.parent != null) {
          let condition = {
            category_id: id
          }
          let updateProducts = await ProductService.updateProductsByCategory(details, condition)
          console.log("updated Products Successfully" + updateProducts);
        }
        if (updatedCategory.parent == null) {
          let store_id = updatedCategory.store_id
          let mainCatId = updatedCategory.id
          let subCat = await CategoryService.getCategories(store_id, mainCatId)
          subCat.forEach(cat => {
            let subCatId = cat.id
            let updateCondition = {
              category_id: subCatId,
            }
            let updateProducts = ProductService.updateProductsByCategory(details, updateCondition)
          });
        }
      }

      return res.status(200).send(ResponseService.success({ category: updatedCategory }));
    } catch (e) {
      return res.status(e.code || 500).send(ResponseService.failure(e));
    }
  }

  async getAllStoreCategories(req, res) {
    try {
      const type = req._userInfo._user_type;

      let store_id;

      if (type == 2) store_id = req._userInfo._user_id;
      else store_id = req.query.store_id;

      const pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
      const perPage = parseInt(req.query.perPage || config.pagination.perPage);
      const search = req.query.search || '';
      const sort = { [req.query.name]: Number(req.query.sortType) };

      if (!store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);
      if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('store_id', messages.ID_INVALID);

      const categories = await CategoryService.getCategoriesWithPagination(pageNo, perPage, store_id, search, sort);

      const paginationVariables = {
        pageNo,
        perPage
      };

      const count = await CategoryService.getTotalCategoriesCount(store_id, search);

      paginationVariables.totalItems = count.length;

      return res.status(200).send(ResponseService.success({ categories, paginationVariables }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  }

  async getAllStoreCategoriesForCategoryManagement(req, res) {
    try {
      const type = req._userInfo._user_type;

      let store_id;

      if (type == 2) store_id = req._userInfo._user_id;
      else store_id = req.query.store_id;

      if (!store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);
      if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('store_id', messages.ID_INVALID);

      const categories = await CategoryService.getAllStoreCategoriesForCategoryManagement(store_id);

      return res.status(200).send(ResponseService.success({ categories }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  }

  async getCategoryDetails(req, res) {
    try {
      const { id } = req.params;

      const pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
      const perPage = parseInt(req.query.perPage || config.pagination.perPage);
      const search = req.query.search || '';

      if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('category_id', messages.ID_INVALID);

      const condition = {
        _id: id
      };

      const type = req._userInfo._user_type;
      if (type == 2) condition.store_id = req._userInfo._user_id;

      let category = await CategoryService.getOnlyCategory(condition);
      if (!category) throw new apiError.ValidationError('id', messages.ID_INVALID);

      category = await CategoryService.getCategorySubcategories(id, pageNo, perPage, search);
      category = category.length > 0 ? category[0] : {};

      const paginationVariables = {
        pageNo,
        perPage
      };

      const count = await CategoryService.getTotalSubCategoriesCount({ parent: mongoose.Types.ObjectId(id) }, search);
      paginationVariables.totalItems = count.length;

      return res.status(200).send(ResponseService.success({ category, paginationVariables }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  }

  async deleteCategory(req, res) {
    try {
      const type = req._userInfo._user_type;

      const { id } = req.params;
      if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

      let category;

      if (type == 2) {
        category = await CategoryService.getOnlyCategory({ _id: id, store_id: req._userInfo._user_id });
        if (!category) throw new apiError.ValidationError('category_id', messages.ID_INVALID);
      } else {
        category = await CategoryService.getCategory(id);
        category = category[0];
        if (!category) throw new apiError.ValidationError('category_id', messages.ID_INVALID);
      }

      if (!category.parent) {
        console.log('psrent category');
        const data = await CategoryService.deleteCategory(category);
        return res.status(200).send(ResponseService.success({ data }));
      }
      console.log('subcategory');
      const data = await CategoryService.deleteSubCategory(category._id);
      return res.status(200).send(ResponseService.success({ data }));
    } catch (e) {
      return res.status(e.code || 500).send(ResponseService.failure(e));
    }
  }
}

module.exports = new CategoryController();
