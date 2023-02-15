const mongoose = require('mongoose');
const Area = require('../models/area')
const City = require('../models/cities')
const Store = require('../models/store')
const apiError = require('../common/api-errors');
const StoreService = require('./store');

class AreaService {

    getOnlyCitiesWithPagination(search, pageNo, perPage) {
        return City.find({ name: new RegExp(search, 'i') }).select('-areas').skip((pageNo - 1) * perPage).limit(perPage);
    }

    getCityCount(request, search) {
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
        return City.countDocuments(condition);
    }

    getOnlyActiveCities() {
        return City.find({status: 1}).select('-areas');
    }

    getAreasWithPagination(city_id, search, pageNo, perPage) {
        return City.findById(city_id).populate({
            path: 'areas',
            match: { name: new RegExp(search, 'i') },
            options: {
                sort: {},
                skip: (pageNo - 1) * perPage,
                limit: perPage
            },
        });
    }

    async getAreaCount(city_id, search) {

        let city = await City.findById(city_id).populate({
            path: 'areas',
            match: { name: new RegExp(search, 'i') },
        });

        return city.areas.length;
    }

    getActiveCityAreas(city_id) {
        return City.findById(city_id).populate({
            path: 'areas',
            match: { status: 1 }
        });
    }

    getCity(request) {
        return City.findOne(request);
    }

    getArea(request) {
        return Area.findOne(request);
    }

    async addArea(details) {

        const session = await mongoose.startSession();
        session.startTransaction();
        const opts = { session };

        try {
            let city_id = (details.city_id);
            let cityOne = await City.findById(city_id);
            delete details.city_id;

            if (!cityOne) throw new apiError.InternalServerError();
            
            let area = await new Area(details).save(opts);
            if (!area) throw new apiError.InternalServerError();
            
            let city = await City.findOneAndUpdate({ _id: city_id }, { $push: { areas: area._id } }, opts);
            if(!city) throw new apiError.InternalServerError();

            await session.commitTransaction();
            session.endSession();

            return city;

        } catch (e) {
            await session.abortTransaction();
            session.endSession();

            return e;
        }
    }

    updateArea(criteria, details) {
        return Area.findOneAndUpdate(criteria, details, {new: true});
    }

    async deleteArea(area_id, parentSession = null) {

        let session;

        if (parentSession) {

            session = parentSession;

        } else {

            session = await mongoose.startSession();
            session.startTransaction();
        }

        console.log('area session ------------------------------------------------------------')

        const opts = { session };

        try {

            let stores = await Store.update({ 'address.area_id': mongoose.Types.ObjectId(area_id) }, { $pull: { address: { area_id : mongoose.Types.ObjectId(area_id) } } }, opts)
            let deletedArea = await Area.deleteMany({_id: area_id}, opts);
            let city = await City.update({ 'areas': mongoose.Types.ObjectId(area_id) }, { $pullAll: { areas: [mongoose.Types.ObjectId(area_id)] } }, opts)

            if (!parentSession) {

                await session.commitTransaction();
                session.endSession();
            }

            return deletedArea;

        } catch (e) {
            console.log('e', e)
            await session.abortTransaction();
            session.endSession();

            return e;
        }

    }

}


module.exports = new AreaService();