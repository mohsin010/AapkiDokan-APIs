const AreaService = require('../../services/area');
const ResponseService = require('../../common/response');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');

class AreaController {

    async getCitiesList(req, res) {

        try {

            let search = req.query.search || '';

            let pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
            let perPage = parseInt(req.query.perPage || config.pagination.perPage);

            let cities = await AreaService.getOnlyCitiesWithPagination(search, pageNo, perPage);

            let totalCityCount = await AreaService.getCityCount({}, search);

            if (!cities) throw apiError.InternalServerError();

            return res.status(200).send(ResponseService.success({ cities, totalCityCount }));

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async getAreasList(req, res) {

        try {

            let city_id = req.query.city_id

            let pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
            let perPage = parseInt(req.query.perPage || 2);
            let search = req.query.search || '';

            if (!city_id) throw new apiError.ValidationError('city_id', messages.CITY_ID_REQUIRED);

            let city = await AreaService.getAreasWithPagination(city_id, search, pageNo, perPage);

            let totalAreaCount = await AreaService.getAreaCount(city_id, search);

            return res.status(200).send(ResponseService.success({ city, totalAreaCount }));

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async addArea(req, res) {
        try {
            let request = Object.assign({}, req.body);
            if (!request.name) throw new apiError.ValidationError('area_details', messages.NAME_REQUIRED)
            if (!request.status) throw new apiError.ValidationError('area_details', messages.STATUS_REQUIRED)
            if (!request.city_id) throw new apiError.ValidationError('area_details', messages.CITY_ID_REQUIRED)

            let area = await AreaService.addArea(request);

            return res.status(200).send(ResponseService.success({ area }));
        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async updateArea(req, res) {
        try {
            let request = Object.assign({}, req.body);
            let area_id = req.params.id;

            let area = await AreaService.getArea({ _id: area_id });
            if (!area) throw new apiError.InternalServerError();

            area = await AreaService.updateArea({ _id: area_id }, request);

            return res.status(200).send(ResponseService.success({ area }));
        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async deleteArea(req, res) {

        try {

            let area_id = req.params.id;

            let area = await AreaService.getArea({ _id: area_id });
            if (!area) throw new apiError.ValidationError('area_id', messages.AREA_ID_INVALID);

            let deletedArea = await AreaService.deleteArea(area_id);
            console.log('deletedArea', deletedArea)
            return res.status(200).send(ResponseService.success({ area: deletedArea }));

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

}

module.exports = new AreaController();