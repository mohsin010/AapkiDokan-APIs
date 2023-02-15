const StoreService = require('../../services/store');
const SlotService = require('../../services/slot');
const AreaService = require('../../services/area');
const ProductService = require('../../services/product');
const CategoryService = require('../../services/category');
const ConfigService = require('../../services/config');
const ResponseService = require('../../common/response');
const HelperService = require('../../common/helper');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');
const mongoose = require('mongoose');

class StoreController {

    async getStoreBasedOnArea(req, res) {

        try {

            // await SlotService.cancelScheduler();

            let request = Object.assign({}, req.query);

            if (!request.area_id) throw new apiError.ValidationError('area_id', messages.AREA_ID_REQUIRED)
            if (!HelperService.isValidMongoId(request.area_id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

            let categories = await StoreService.getStoresGroupedByCategories({ 'address.area_id': mongoose.Types.ObjectId(request.area_id), status: 1, storeCategory: { $ne: null } })
            // await StoreService.getStoresList({ 'address.area_id': mongoose.Types.ObjectId(request.area_id), status: 1});
            let area = await AreaService.getArea({ _id: request.area_id });
            let city = await AreaService.getCity({ areas: request.area_id })

            return res.status(200).send(ResponseService.success({ categories, area, city }));

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async storeHomePage(req, res) {

        try {

            let store_id = req.params.id;

            // await SlotService.slotScheduler();

            if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

            let store = await StoreService.getStore({ _id: store_id });
            if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID)

            if (store.status != 1) throw new apiError.UnauthorizedError(messages.STORE_INACTIVE)

            let featured_products_data = await ProductService.getStoreFeaturedProducts(store_id);
            let featured_products = featured_products_data.length > 0 ? featured_products_data : [];

            let best_selling_products_data = await ProductService.getBestSellingProducts(store_id);
            let best_selling_products = best_selling_products_data.length > 0 ? best_selling_products_data : [];

            let categories = await CategoryService.getCategories(store_id); 

            let adminConfig = await ConfigService.getConfig();

            let taxes = adminConfig.taxes;

            let delivery_charges = store.delivery_charges;

            return res.status(200).send(ResponseService.success({ featured_products: featured_products, best_selling_products: best_selling_products, categories, store, taxes, delivery_charges }));

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }

    }


    async getStoreTimingSlots(req, res) {

        console.log('store timings')

        // let store_id = req.params.id;

        // if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

        // let store = await StoreService.getStore({ _id: store_id });
        // if(!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID)

        // let startTime = store.timings.open_time;
        // let endTime = store.timings.close_time;

        // let interval = config.slots.eachSlotTime;

        // let days = config.slots.days;

        // let currentTime = new Date().getHours()

        try {

            let store_id = req.params.id;

            if (!HelperService.isValidMongoId(store_id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

            let store = await StoreService.getStore({ _id: store_id });
            if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID)

            let slots = await SlotService.getSlots(store_id);

            return res.status(200).send(ResponseService.success({ slots, store }));

        } catch (e) {
            console.log(e)
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }

    }


    async getStoreDetailsFromLink(req, res) {

        try {

            let addressLink = req.query.addressLink;

            let store = await StoreService.getStore({ "address.unique_link": addressLink });
            if (!store) throw new apiError.ValidationError('id', messages.LINK_INVALID);

            let selectedAddress;
            for (let i = 0; i < store.address.length; i++) {
                const element = store.address[i];
                if (element.unique_link == addressLink) {
                    selectedAddress = element;
                    break;
                }
            }

            let area_id = selectedAddress.area_id;
            res.send(ResponseService.success({ store, area_id }));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

}

module.exports = new StoreController();