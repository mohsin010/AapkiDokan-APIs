const CouponService = require('../../services/coupon');
const StoreService = require('../../services/store');
const ResponseService = require('../../common/response');
const HelperService = require('../../common/helper');
const messages = require('../../common/messages');
const apiError = require('../../common/api-errors');
const momemt = require('moment-timezone');

class CouponController {

    async getCoupons(req, res) { 
        try {
 
            let pageNo = parseInt(req.query.pageNo || config.pagination.pageNo);
            let perPage = parseInt(req.query.perPage || config.pagination.perPage);
            let search = req.query.search || '';
            let sort = { [req.query.name] : Number (req.query.sortType )}
            
            let criteria = {};

            const type = req._userInfo._user_type;
            if (type == 2) criteria.store_id = req._userInfo._user_id
            
            console.log('store_id', criteria.store_id)

            let coupon = await CouponService.getCouponsWithPagination(criteria, pageNo, perPage, search, sort );

            let paginationVariables = {
                pageNo: pageNo,
                perPage: perPage
            };

            paginationVariables.totalItems = await CouponService.getTotalCouponsCount(criteria, search);

            return res.status(200).send(ResponseService.success({coupon, paginationVariables}));
        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

    //for add coupons using controllers/store/coupons => addCoupon() method
    async addCoupon(req, res) {

        try {

            let request = Object.assign({}, req.body);

            if(!request.store) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED)

            const type = req._userInfo._user_type;

            if (type == 2) {
                if (request.store._id != req._userInfo._user_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID)
            }
            
            let store = await StoreService.getStore({_id: request.store._id})
            if(!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

            let couponCheck = await CouponService.getCoupon({code : request.code, 'store._id': request.store._id })
            if (couponCheck) throw new apiError.ResourceAlreadyExistError('code',messages.COUPON_ALREADY_EXIST )

            request.start_date = momemt( request.start_date ).startOf('day');  
            request.end_date = momemt ( request.end_date ).endOf('day');
            console.log(request , '---------');
            
            let coupon = await CouponService.addCoupon(request);

            return res.status(200).send(ResponseService.success({coupon}));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }

    }

    async updateCoupon(req, res) {
        try {
            let request = Object.assign({}, req.body);
            
            delete request.created_at;
            delete request.updated_at;

            const type = req._userInfo._user_type;

            if(!request.store) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED)
            
            if (type == 2) {
                if(request.store._id != req._userInfo._user_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID)
            }

            let store = await StoreService.getStore({_id: request.store._id})
            if(!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

            request.start_date = momemt( request.start_date ).startOf('day');  
            request.end_date = momemt ( request.end_date ).endOf('day');

            let id = req.params.id;

            let coupon = await CouponService.updateCoupon({_id: id}, request);

            return res.status(200).send(ResponseService.success({coupon}));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

    async deleteCoupon (req, res) {

        try {
            
            let id = req.params.id;
            if (!HelperService.isValidMongoId(id)) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

            const type = req._userInfo._user_type;

            if (type == 2) {

                let coupon = await CouponService.getCoupon({ _id: id, "store._id": req._userInfo._user_id });
                if (!coupon) throw new apiError.ValidationError('coupon_id', messages.ID_INVALID);

            } else {

                let coupon = await CouponService.getCoupon({_id: id});
                if (!coupon) throw new apiError.ValidationError('coupon_id', messages.ID_INVALID);

            } 

            let deletedCoupon = await CouponService.deleteCoupon({ _id: id})
            return res.status(200).send(ResponseService.success({ coupon: deletedCoupon }));
            
        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));            
        }
    }

}

module.exports = new CouponController();