const CouponService = require('../../services/coupon');
const StoreService = require('../../services/store');
const OrderService = require('../../services/order');
const ResponseService = require('../../common/response');
const messages = require('../../common/messages');
const apiError = require('../../common/api-errors');
const moment = require('moment-timezone');

class CouponController {


    async checkCoupon(req, res) {

        try {

            let type = this.getUserType(req.baseUrl);
            console.log('type', type);

            let user_id;
            if (type == 1) user_id = req.query.user_id;
            else user_id = req._userInfo._user_id;

            let code = req.query.coupon_code;
            if (!code) throw new apiError.ValidationError('coupon_code', messages.COUPON_CODE_REQUIRED)

            let store_id = req.query.store_id;
            if (!store_id) throw new apiError.ValidationError('coupon_code', messages.STORE_ID_REQUIRED)

            let store = await StoreService.getStore({ _id: store_id });
            if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

            let cart_value = req.query.cart_value;
            if (!cart_value) throw new apiError.ValidationError('cart_value', messages.CART_VALUE_REQUIRED);

            cart_value = Number(cart_value);

            let coupon = await CouponService.getCoupon({ code: code, 'store._id': store_id, status: 1, end_date: { "$gte": moment().toDate() }, start_date: { "$lte": moment().toDate() } });

            if (!coupon) throw new apiError.ValidationError('coupon_code', messages.COUPON_INVALID);

            if (coupon.usage < 1) throw new apiError.ValidationError('coupon_code', messages.COUPON_INVALID);

            if (cart_value < coupon.min_order_amount) throw new apiError.ValidationError('coupon_code', `This coupon can only be applied on amount  ${coupon.min_order_amount} PKR or greater`)

            let order = await OrderService.getOrder({ customer_id: user_id, 'coupon._id': coupon._id, store_id: store_id });
            // let check_coupon = await OrderService.getOrder({ customer_id: user_id, 'coupon._id': mongoose.ObjectId(request.coupon_id), store_id: request.store_id });

            console.log('order', order);
            if (order) throw new apiError.ValidationError('coupon_code', messages.COUPON_CODE_ALREADY_USED);

            return res.status(200).send(ResponseService.success({ coupon }));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }

    }

    getUserType(url) {
        console.log('url', url)
        let type = url.split('/')[2];

        switch (type) {
            case 'admin':
                return 1;
            case 'store':
                return 2;
            case 'customer':
                return 3;
            case 'driver':
                return 4;
            default:
                return 0;
        }
    }
}

module.exports = new CouponController();