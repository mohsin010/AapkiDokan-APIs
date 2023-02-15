const City = require('../models/cities')
const AreaService = require('./area');
const mongoose = require('mongoose');

class CityService {

    addCity(details) {
        return new City(details).save();
    }

    getCity(id) {
        return City.findById(id);
    }

    updateCity(criteria, details) {
        return City.findOneAndUpdate(criteria, details, {new: true});
    }

    async deleteCity(city_id) {

        const session = await mongoose.startSession();
        session.startTransaction();
        const opts = { session };

        try {

            let city = await City.findById(city_id);

            for (let i = 0; i < city.areas.length; i++) {
                const element = city.areas[i];

                let deletedArea = await AreaService.deleteArea(element, session);
            }

            let deletedCity = await City.deleteMany({ _id: city_id }, opts);

            await session.commitTransaction();
            session.endSession();

            return deletedCity;

        } catch (e) {
            console.log('e', e)
            await session.abortTransaction();
            session.endSession();

            return e;
        }
    }
}


module.exports = new CityService();