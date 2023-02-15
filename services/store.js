const Store = require('../models/store');
const Slot = require('../models/slot');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const config = require('../config/constants');
const OrderService = require('./order');
const CategoryService = require('./category');

const Category = require('../models/category')
const Product = require('../models/product')

class StoreService {

    getStore(request) {
        return Store.findOne(request)
    }
    findStore(request){
        return Store.findOne({_id: request})
    }
    getStoresList(request) {
        return Store.find(request); //.populate('address.area_id').populate('address.city_id') //.populate({path: 'area', select: 'name _id'});
    }

    getStoresGroupedByCategories(request) {
        return Store.aggregate([
            {
                $match: request,
            },
            {
                $group: {
                    _id: "$storeCategory",
                    stores: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "storecategories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $match: {
                    'categoryDetails.status': 1
                }
            },
            {
                $unwind: "$categoryDetails"
            }
        ])
    }

    async createStore(details) {
        const session = await mongoose.startSession();
        session.startTransaction();
        const opts = { session };
        try {

            let store = await new Store(details).save(opts);
            if (!store) throw apiError.InternalServerError();

            let days = config.slots.days;

            for (let i = 0; i < days; i++) {

                let startTime = store.timings.open_time;
                let endTime = store.timings.close_time;

                console.log('startTime', startTime)
                console.log('endTime', endTime)

                let interval = config.slots.eachSlotTime;


                console.log(moment().format('YYYY-MM-DD') + ' ' + startTime);

                let start = moment(moment().format('YYYY-MM-DD') + ' ' + startTime, 'YYYY-MM-DD HH:mm').add(i, 'd')
                let end = moment(moment().format('YYYY-MM-DD') + ' ' + endTime, 'YYYY-MM-DD HH:mm').add(i, 'd')

                console.log('start', start.format('YYYY-MM-DD HH:mm'))
                console.log('end', end.format('YYYY-MM-DD HH:mm'))

                while (end.diff(start, 'hours') > 0) {

                    let slot_start = moment(start) //.add(days, 'days');
                    let slot_end = moment(slot_start).add(interval, 'hours');

                    start.add(interval, 'hours');

                    let slotObject = {
                        start_time: slot_start.toISOString(),
                        end_time: slot_end.toISOString(),
                        store_id: store._id
                    }

                    console.log('------------------------------------------------------------------------------------------------------')
                    console.log(slotObject);
                    console.log('------------------------------------------------------------------------------------------------------')
                    let slot = await new Slot(slotObject).save(opts);
                    if (!slot) throw apiError.InternalServerError();

                }

            }

            await session.commitTransaction();
            session.endSession();

            return { store, success: true };

        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            return { error: e, success: false };
        }
    }

    updateStore(details, criteria) {
        console.log('details-------------------------->', details)
        console.log('criteria------------------------>', criteria)
        return Store.findOneAndUpdate(criteria, details, { new: true })
    }

    getStoreDriverDetails(request) {
        return Store.findOne(request).populate({
            path: 'drivers',
            match: { status: 1 },
        })
    }

    getTotalStoreCount(request, search) {
        let condition = {
            $and:
                [
                    {
                        $or:
                            [
                                { name: new RegExp(search, 'i') },
                            ]
                    },
                    request
                ]
        }
        return Store.countDocuments(condition);
    }

    getStoresWithPagination(request, pageNo, perPage, search, sort) {

        let condition = {
            $and:
                [
                    {
                        $or:
                            [
                                { name: new RegExp(search, 'i') },
                            ]
                    },
                    request
                ]
        }

        // To Get All Stores
        if (pageNo == -1) return Store.find(condition)
        return Store.find(condition).skip((pageNo - 1) * perPage).limit(perPage).sort(sort)
    }


    getStorePaymentDetails(from_date, to_date) {

        return Store.aggregate([
            {
                $match: {
                    $and: [{ created_at: { $gt: moment(from_date).toDate(), $lt: moment(to_date).toDate() } }]
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "store_id",
                    as: "orders"
                }
            },
        ])

    }

    async deleteStore(store_id, parentSession) {

        let session;

        if (parentSession) {

            session = parentSession;

        } else {

            session = await mongoose.startSession();
            session.startTransaction();
        }

        console.log('store session ------------------------------------------------------------')

        const opts = { session };

        try {

            let categories = await CategoryService.getCategories(store_id);

            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];

                if (category._id) {
                    let deletedCategory = await CategoryService.deleteCategory(category, session)

                } else {
                    throw new Error('Invalid Category ID');
                }

            }

            let deletedStore = await Store.deleteMany({ _id: store_id }, opts)

            if (!parentSession) {

                await session.commitTransaction();
                session.endSession();
            }

            return deletedStore;

        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            return e;
        }

    }

    getStoreByCategoryId(storeCategoryId) {
        return Store.findOne({ storeCategory: storeCategoryId })
    }

}

module.exports = new StoreService();