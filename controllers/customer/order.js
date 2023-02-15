/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const moment = require('moment-timezone');
const cryptoRandomString = require('crypto-random-string');
//import cryptoRandomString from 'crypto-random-string';
const mongoose = require('mongoose');
const CustomerService = require('../../services/customer');
const AreaService = require('../../services/area');
const StoreService = require('../../services/store');
const SlotService = require('../../services/slot');
const NotificationService = require('../../services/notification');
const ProductService = require('../../services/product');
const ConfigService = require('../../services/config');
const OrderService = require('../../services/order');
const CouponService = require('../../services/coupon');
const DriverService = require('../../services/driver');
const HelperService = require('../../common/helper');
const ResponseService = require('../../common/response');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');
const PushNotification = require('../../common/push-notification');
const InvoiceService = require('../../common/invoice/invoicePdf');
const MailerService = require('../../common/mailer');
const notificationMessages = require('../../common/notification-messages');


module.exports = {

  async placeOrder(req, res) {
    // try {
    //   const request = { ...req.body };

    //   const type = module.exports.getUserType(req.baseUrl);

    //   let userId;
    //   if (type === 1) userId = req.body.user_id;
    //   else userId = req._userInfo._user_id;

    //   const orderDetails = {};

    //   const customer = await CustomerService.getCustomer({ _id: userId });
    //   if (!customer) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID);

    //   if (!request.address_id) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_REQUIRED);
    //   if (!request.store_address_id) throw new apiError.ValidationError('store_address_id', messages.ADDRESS_ID_REQUIRED);

    //   let address = {};

    //   for (let i = 0; i < customer.address.length; i++) {
    //     if (customer.address[i]._id.toString() === request.address_id) {
    //       address = customer.address[i];
    //     }
    //   }

    //   if (Object.keys(address).length === 0) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_INVALID);

    //   orderDetails.address = {};
    //   orderDetails.address.delivery = address;

    //   if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

    //   const store = await StoreService.getStore({ _id: request.store_id });
    //   if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

    //   if (!request.slot_id && !request.is_express_delivery) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_REQUIRED);

    //   if (!store.has_express_delivery && request.is_express_delivery) throw new apiError.ValidationError('express_Delivery', messages.STORE_DOESNT_SUPPORT_EXPRESS_DELIVERY);

    //   const adminConfig = await ConfigService.getConfig();

    //   if (request.slot_id) {
    //     const slot = await SlotService.getSlot({ _id: request.slot_id, store_id: store._id });
    //     if (!slot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

    //     if (slot.status === 2) throw new apiError.ValidationError('slot_id', messages.SLOT_INACTIVE);

    //     if (slot.ordersCount >= adminConfig.per_slot_order_limit) throw new apiError.ValidationError('slot', messages.SLOT_FULL);

    //     const slotOrderCount = slot.ordersCount + 1;
    //     const updateSlot = await SlotService.updateSlot(
    //       { _id: request.slot_id },
    //       { ordersCount: slotOrderCount }
    //     );
    //     if (!updateSlot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

    //     orderDetails.slot_id = request.slot_id;
    //     orderDetails.deliver_start_time = slot.start_time;
    //     orderDetails.deliver_end_time = slot.end_time;
    //   } else {
    //     orderDetails.deliver_start_time = moment().toISOString();
    //     orderDetails.deliver_end_time = moment().add(2, 'h').toISOString();
    //     orderDetails.is_express_delivery = true;
    //   }

    //   orderDetails.is_delivered_by_store = store.self_delivery;
    //   orderDetails.customer_id = userId;
    //   orderDetails.store_id = request.store_id;

    //   let flag = false;

    //   for (let i = 0; i < store.address.length; i++) {
    //     const element = store.address[i];

    //     if (element._id.toString() === request.store_address_id) {
    //       flag = true;
    //       orderDetails.address.pickup = JSON.parse(JSON.stringify(element));
    //     }
    //   }

    //   if (!flag) throw new apiError.ValidationError('store_address_id', messages.STORE_ADDRESS_ID_INVALID);

    //   if (!request.products || request.products.length === 0) throw new apiError.ValidationError('products', messages.PRODUCTS_REQUIRED);

    //   orderDetails.products = [];

    //   orderDetails.total_amount = 0;

    //   const invalidQuantityProducts = [];

    //   const maxorderExceedingProducts = [];

    //   for (let i = 0; i < request.products.length; i++) {
    //     const product = request.products[i];

    //     if (!product._id) throw new apiError.ValidationError('product_id', messages.PRODUCT_ID_REQUIRED);

    //     if (!product.count) throw new apiError.ValidationError('product_count', messages.COUNT_REQUIRED);
    //     if (product.count <= 0) throw new apiError.ValidationError('product_count', messages.COUNT_GREATER_THAN_0);

    //     if (!HelperService.isValidMongoId(product._id)) throw new apiError.ValidationError('id', messages.ID_INVALID);

    //     const productDetail = await ProductService.getProduct({
    //       _id: product._id,
    //       store_id: request.store_id
    //     });
    //     if (!productDetail) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

    //     if (product.count > productDetail.stock_quantity) {
    //       invalidQuantityProducts.push({
    //         _id: product._id,
    //         stock_quantity: productDetail.stock_quantity,
    //         quantity_ordered: product.count
    //       });
    //     }

    //     const orderMax = productDetail.order_max ? productDetail.order_max : 30;

    //     if (product.count > orderMax) {
    //       maxorderExceedingProducts.push({
    //         _id: product._id,
    //         quantity_ordered: product.count,
    //         max_order_limit: orderMax
    //       });
    //     }

    //     orderDetails.products.push({
    //       product_id: productDetail._id,
    //       pictures: productDetail.pictures,
    //       size: productDetail.size,
    //       price: productDetail.price.sale_price,
    //       stock_quantity: productDetail.stock_quantity,
    //       count: product.count,
    //       name: productDetail.name
    //     });

    //     orderDetails.total_amount += (productDetail.price.sale_price * product.count);
    //   }


    //   const { taxes } = adminConfig;

    //   let totalAmountAfterTax = orderDetails.total_amount;

    //   const { delivery_charges: deliveryCharges } = store;

    //   for (let i = 0; i < deliveryCharges.length; i++) {
    //     if (orderDetails.total_amount < deliveryCharges[i].order_amount) {
    //       orderDetails.delivery_charges = deliveryCharges[i].charges;
    //       break;
    //     }
    //   }
    //   orderDetails.taxes = [];

    //   taxes.forEach((tax) => {
    //     const value = (Number(tax.percentage) * orderDetails.total_amount) / 100;
    //     totalAmountAfterTax += value;
    //     orderDetails.taxes.push({
    //       name: tax.name,
    //       value
    //     });
    //   });

    //   orderDetails.total_amount_after_tax = totalAmountAfterTax;

    //   let coupon;

    //   if (request.coupon_id) {
    //     coupon = await CouponService.getCoupon({ _id: request.coupon_id });
    //     if (!coupon || coupon.status === 2) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

    //     if (coupon.usage < 1) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

    //     if (orderDetails.total_amount < coupon.min_order_amount) throw new apiError.ValidationError('coupon_code', `This coupon can only be applied on amount  ${coupon.min_order_amount} PKR or greater`);

    //     orderDetails.coupon = coupon;

    //     const couponCopy = JSON.parse(JSON.stringify(coupon));

    //     const { value } = couponCopy;
    //     delete couponCopy.store;
    //     delete couponCopy.created_at;
    //     delete couponCopy.updated_at;

    //     if (couponCopy.type === 1) orderDetails.discount = value;
    //     else orderDetails.discount = (value * orderDetails.total_amount) / 100;
    //   }

    //   if (invalidQuantityProducts.length > 0) throw new apiError.ModelValidationError({ message: 'Some Products Are Not Available Right Now', outOfStockProducts: invalidQuantityProducts });
    //   if (maxorderExceedingProducts.length > 0) throw new apiError.ModelValidationError({ message: 'Some Products have exceeded their max order limit', maxorderExceededProducts: maxorderExceedingProducts });

    //   orderDetails.commission_percentage = store.commission;

    //   const afterDiscountPrice = orderDetails.total_amount - (orderDetails.discount || 0);

    //   orderDetails.admin_commission_amount = (
    //     orderDetails.commission_percentage * afterDiscountPrice
    //   ) / 100;
    //   orderDetails.store_payout_amount = orderDetails.total_amount_after_tax
    //     - (orderDetails.discount || 0)
    //     - orderDetails.admin_commission_amount;

    //   let uniqueId;

    //   // eslint-disable-next-line no-constant-condition
    //   while (1) {
    //     uniqueId = cryptoRandomString({ length: 7 });

    //     const order = await OrderService.getOrder({ order_id: uniqueId });
    //     if (!order) break;
    //     // eslint-disable-next-line no-continue
    //     else continue;
    //   }
    //   orderDetails.order_id = uniqueId;


    //   // return res.status(200).send(ResponseService.success({ orderDetails }));
    //   const order = await OrderService.addOrder(orderDetails);

    //   if (!store.self_delivery) {
    //     DriverService.getStoreDriversFCMArray(store).then((fcmArray) => {
    //       if (fcmArray.length > 0) {
    //         const { drivers } = store;
    //         const userIds = drivers.map((driver) => driver._id);
    //         PushNotification.notifyMultipleDevices('orderPlace', fcmArray, { order_id: order.order_id }, userIds);
    //       }
    //     });
    //   }

    //   // Send push notification to customer's device
    //   (async () => {
    //     const notification = notificationMessages.orderStatusChange({
    //       title: 'Order has been placed',
    //       orderId: order.order_id,
    //       status: 'has been placed'
    //     });

    //     const notificationPayloadData = {
    //       type: config.notificationTypes.orderStatusChange,
    //       createdAt: moment.utc().toISOString(),
    //       notificationTitle: notification.title,
    //       notificationBody: notification.body,
    //       order_id: order.order_id,
    //       orderStatus: `${order.status}`
    //     };

    //     NotificationService.createNotification({
    //       userId: customer._id,
    //       data: notificationPayloadData
    //     });

    //     PushNotification.notifySingleDevice(
    //       customer.fcm_token,
    //       notification,
    //       notificationPayloadData
    //     );
    //   })();

    //   // Send the mail to customer
    //   MailerService.sendPlacedOrderToCustomer({
    //     order,
    //     customer,
    //     subject: 'Order has been placed',
    //     orderStatusString: `Your order has been confirmed with order id ${`${order.order_id}`.toUpperCase()}`
    //   });

    //   return res.status(200).send(ResponseService.success({ order }));
    // } catch (e) {
    //   return res.status(e.code || 500).send(ResponseService.failure(e));
    // }
    try {

      let request = Object.assign({}, req.body);
     
      const type = module.exports.getUserType(req.baseUrl);


      console.log('type', type);

      let user_id;
      if (type == 1) user_id = req.body.user_id;
      else user_id = req._userInfo._user_id;

      let orderDetails = {};

      let customer = await CustomerService.getCustomer({ _id: user_id });
      if (!customer) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID);

      if (!request.address_id) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_REQUIRED);
      if (!request.store_address_id) throw new apiError.ValidationError('store_address_id', messages.ADDRESS_ID_REQUIRED);

      let address = {};

      for (let i = 0; i < customer.address.length; i++) {
        if (customer.address[i]._id == request.address_id) {
          address = customer.address[i];
        }
      }

      if (Object.keys(address).length == 0) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_INVALID);

      orderDetails.address = {};
      orderDetails.address.delivery = address;

      if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

      let store = await StoreService.getStore({ _id: request.store_id });
      if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

      if (!request.slot_id && !request.is_express_delivery) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_REQUIRED);

      if (!store.has_express_delivery && request.is_express_delivery) throw new apiError.ValidationError('express_Delivery', messages.STORE_DOESNT_SUPPORT_EXPRESS_DELIVERY)

      let adminConfig = await ConfigService.getConfig();

      if (request.slot_id) {

        let slot = await SlotService.getSlot({ _id: request.slot_id, store_id: store._id });
        if (!slot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

        if (slot.status == 2) throw new apiError.ValidationError('slot_id', messages.SLOT_INACTIVE)

        if (slot.ordersCount >= adminConfig.per_slot_order_limit) throw new apiError.ValidationError('slot', messages.SLOT_FULL)

        let slotOrderCount = slot.ordersCount + 1;
        let updateSlot = await SlotService.updateSlot({ _id: request.slot_id }, { ordersCount: slotOrderCount })
        if (!updateSlot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

        orderDetails.slot_id = request.slot_id;
        orderDetails.deliver_start_time = slot.start_time;
        orderDetails.deliver_end_time = slot.end_time;

      } else {

        orderDetails.deliver_start_time = moment().toISOString();
        orderDetails.deliver_end_time = moment().add(2, 'h').toISOString();
        orderDetails.is_express_delivery = true

      }

      orderDetails.is_delivered_by_store = store.self_delivery
      orderDetails.customer_id = user_id;
      orderDetails.store_id = request.store_id;

      let flag = false;

      for (let i = 0; i < store.address.length; i++) {
        const element = store.address[i];

        if (element._id == request.store_address_id) {
          flag = true;

          orderDetails.address.pickup = JSON.parse(JSON.stringify(element));
          console.log('element', orderDetails.address.pickup);

        }
      }

      if (!flag) throw new apiError.ValidationError('store_address_id', messages.STORE_ADDRESS_ID_INVALID)

      if (!request.products || request.products.length == 0) throw new apiError.ValidationError('products', messages.PRODUCTS_REQUIRED);

      orderDetails.products = [];

      orderDetails.total_amount = 0;

      //Added by me
      orderDetails.admin_commission_amount = 0;
      //

      let invalidQuantityProducts = [];

      let maxorderExceedingProducts = [];

      for (let i = 0; i < request.products.length; i++) {

        let product = request.products[i];

        if (!product._id) throw new apiError.ValidationError('product_id', messages.PRODUCT_ID_REQUIRED);

        if (!product.count) throw new apiError.ValidationError('product_count', messages.COUNT_REQUIRED);
        if (product.count <= 0) throw new apiError.ValidationError('product_count', messages.COUNT_GREATER_THAN_0);

        if (!HelperService.isValidMongoId(product._id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

        let productDetail = await ProductService.getProduct({ _id: product._id, store_id: request.store_id });
        if (!productDetail) throw new apiError.ValidationError('product_id', messages.ID_INVALID);

        if (product.count > productDetail.stock_quantity) {

          invalidQuantityProducts.push({
            _id: product._id,
            stock_quantity: productDetail.stock_quantity,
            quantity_ordered: product.count
          })

        }

        let order_max = productDetail.order_max ? productDetail.order_max : 30;

        if (product.count > order_max) {

          maxorderExceedingProducts.push({
            _id: product._id,
            quantity_ordered: product.count,
            max_order_limit: order_max
          })

        }
        // i have change this module
        let commissionPercentage = productDetail.commission.store_comm
        let productTotalPrice = productDetail.price.sale_price * product.count
        let productCommission = (commissionPercentage * productTotalPrice) / 100
        orderDetails.admin_commission_amount += productCommission

        orderDetails.products.push({
          product_id: productDetail._id,
          pictures: productDetail.pictures,
          size: productDetail.size,
          price: productDetail.price.sale_price,
          stock_quantity: productDetail.stock_quantity,
          count: product.count,
          name: productDetail.name,
          category_id: productDetail.category_id,
          commission: productDetail.commission
        })

        orderDetails.total_amount += (productDetail.price.sale_price * product.count)

      }

      const { taxes } = adminConfig;

      let totalAmountAfterTax = orderDetails.total_amount;

      const { delivery_charges: deliveryCharges } = store;

      for (let i = 0; i < deliveryCharges.length; i++) {
        if (orderDetails.total_amount < deliveryCharges[i].order_amount) {
          orderDetails.delivery_charges = deliveryCharges[i].charges;
          break;
        }
      }
      orderDetails.taxes = [];

      taxes.forEach((tax) => {
        const value = (Number(tax.percentage) * orderDetails.total_amount) / 100;
        totalAmountAfterTax += value;
        orderDetails.taxes.push({
          name: tax.name,
          value
        });
      });

      orderDetails.total_amount_after_tax = totalAmountAfterTax;


      // let taxes = adminConfig.taxes;

      // let total_amount_after_tax = orderDetails.total_amount;

      // let delivery_charges = adminConfig.delivery_charges;

      // for (let i = 0; i < delivery_charges.length; i++) {
      //   if (orderDetails.total_amount < delivery_charges[i].order_amount) {
      //     orderDetails.delivery_charges = delivery_charges[i].charges;
      //     break;
      //   }

      // };
      // orderDetails.taxes = [];

      // taxes.forEach(tax => {

      //   let value = (tax.percentage * orderDetails.total_amount) / 100;
      //   total_amount_after_tax = total_amount_after_tax + value;
      //   orderDetails.taxes.push({
      //     name: tax.name,
      //     value: value
      //   })
      // });

      // orderDetails.total_amount_after_tax = total_amount_after_tax;

      let coupon;

      if (request.coupon_id) {

        let check_coupon = await OrderService.getOrder({ customer_id: user_id, 'coupon._id': request.coupon_id, store_id: request.store_id });
        // console.log('order', order);
        if (check_coupon) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

        coupon = await CouponService.getCoupon({ _id: request.coupon_id });
        if (!coupon || coupon.status == 2) throw new apiError.ValidationError('coupon_id', 'Coupon is already used. Please proceed from cart');

        if (coupon.usage < 1) throw new apiError.ValidationError('coupon_id', 'Coupon is already used. Please proceed from cart');

        if (orderDetails.total_amount < coupon.min_order_amount) throw new apiError.ValidationError('coupon_code', `This coupon can only be applied on amount  ${coupon.min_order_amount} PKR or greater`)

        orderDetails.coupon = coupon

        let couponCopy = JSON.parse(JSON.stringify(coupon));

        let value = couponCopy.value;

        console.log('-------------------------------------', couponCopy)
        delete couponCopy.store;
        delete couponCopy.created_at;
        delete couponCopy.updated_at;

        if (couponCopy.type == 1) orderDetails.discount = value
        else orderDetails.discount = (value * orderDetails.total_amount) / 100;


      }

      if (invalidQuantityProducts.length > 0) throw new apiError.ModelValidationError({ message: 'Some Products Are Not Available Right Now', outOfStockProducts: invalidQuantityProducts })
      if (maxorderExceedingProducts.length > 0) throw new apiError.ModelValidationError({ message: 'Some Products have exceeded their max order limit', maxorderExceededProducts: maxorderExceedingProducts })

      orderDetails.commission_percentage = store.commission;

      let afterDiscountPrice = orderDetails.total_amount_after_tax - (orderDetails.discount || 0)
      //Changed by me
      afterDiscountPrice = afterDiscountPrice - orderDetails.admin_commission_amount
      console.log(orderDetails.admin_commission_amount)
      orderDetails.store_payout_amount = orderDetails.total_amount_after_tax - (orderDetails.discount || 0) - orderDetails.admin_commission_amount;

      let uniqueId;

      // eslint-disable-next-line no-constant-condition
      while (1) {
        uniqueId = cryptoRandomString({ length: 7 });

        const order = await OrderService.getOrder({ order_id: uniqueId });
        if (!order) break;
        // eslint-disable-next-line no-continue
        else continue;
      }
      orderDetails.order_id = uniqueId.toString();


      // return res.status(200).send(ResponseService.success({ orderDetails }));
      const order = await OrderService.addOrder(orderDetails);

      if (!store.self_delivery) {
        DriverService.getStoreDriversFCMArray(store).then((fcmArray) => {
          if (fcmArray.length > 0) {
            const { drivers } = store;
            const userIds = drivers.map((driver) => driver._id);
            PushNotification.notifyMultipleDevices('orderPlace', fcmArray, { order_id: order.order_id }, userIds);
          }
        });
      }

      // Send push notification to customer's device
      (async () => {
        const notification = notificationMessages.orderStatusChange({
          title: 'Order has been placed',
          orderId: order.order_id,
          status: 'has been placed'
        });

        const notificationPayloadData = {
          type: config.notificationTypes.orderStatusChange,
          createdAt: moment.utc().toISOString(),
          notificationTitle: notification.title,
          notificationBody: notification.body,
          order_id: order.order_id,
          orderStatus: `${order.status}`
        };

        NotificationService.createNotification({
          userId: customer._id,
          data: notificationPayloadData
        });

        PushNotification.notifySingleDevice(
          customer.fcm_token,
          notification,
          notificationPayloadData
        );
      })();

      // Send the mail to customer
      MailerService.sendPlacedOrderToCustomer({
        order,
        customer,
        subject: 'Order has been placed',
        orderStatusString: `Your order has been confirmed with order id ${`${order.order_id}`.toUpperCase()}`
      });

      return res.status(200).send(ResponseService.success({ order }));
    } catch (e) {
      console.log(e);
      return res.status(e.code || 500).send(ResponseService.failure(e));
    }

  },

  async getOrders(req, res) {
    try {
      const userId = req._userInfo._user_id;

      const customer = await CustomerService.getCustomer({ _id: userId });
      if (!customer) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID);

      let sort;
      if (req.query.name) sort = { [req.query.name]: Number(req.query.sortType) };

      const search = req.query.search || '';
      let orders;

      let { pageNo } = req.query;
      if (!pageNo) {
        if (search) {
          const request = {
            customer_id: mongoose.Types.ObjectId(userId),
            store_id: mongoose.Types.ObjectId(search)
          };
          orders = await OrderService.getOrders(request, sort);
        } else {
          orders = await OrderService.getOrders(
            { customer_id: mongoose.Types.ObjectId(userId) },
            sort
          );
        }

        return res.status(200).send(ResponseService.success({ orders }));
      }

      pageNo = Number(req.query.pageNo || config.pagination.pageNo);
      const perPage = Number(req.query.perPage || config.pagination.perPage);

      let orderCount;
      if (search) {
        const request = {
          customer_id: mongoose.Types.ObjectId(userId),
          store_id: mongoose.Types.ObjectId(search)
        };
        orders = await OrderService.getOrders(request, sort, pageNo, perPage);

        orderCount = await OrderService.getTotalOrdersCount(request);
      } else {
        orders = await OrderService.getOrders(
          { customer_id: mongoose.Types.ObjectId(userId) },
          sort,
          pageNo,
          perPage
        );
        orderCount = await OrderService.getTotalOrdersCount({
          customer_id: mongoose.Types.ObjectId(userId)
        });
      }

      return res.status(200).send(ResponseService.success({ orders, totalCount: orderCount }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async getOrderById(req, res) {
    try {
      const { _user_id: customerId } = req._userInfo;
      const { id: orderId } = req.params;
      if (!orderId) {
        throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);
      }
      const request = {
        _id: mongoose.Types.ObjectId(orderId),
        customer_id: mongoose.Types.ObjectId(customerId)
      };
      const order = await OrderService.getOrderWithStoreDetails(request);
      // TODO: change the logic above to get the single order only
      return res.status(200).send(ResponseService.success({ order: order[0] }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async cancelOrder(req, res) {
    try {
      const userId = req._userInfo._user_id;

      const { order_id: orderId } = req.body;
      if (!orderId) throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);

      const order = await OrderService.getOrder({ _id: orderId, customer_id: userId });
      if (!order) throw new apiError.ValidationError('order_id', messages.ORDER_ID_INVALID);

      if (order.status !== 1) {
        if (order.status === 2) throw new apiError.ValidationError('order', messages.ORDER_CANNOT_BE_CANCELLED_AFTER_PICKUP);
        if (order.status === 3) throw new apiError.ValidationError('order', messages.ORDER_CANNOT_BE_CANCELLED_AFTER_DELIVERED);
        if (order.status === 4 || order.status === 5) throw new apiError.ValidationError('order', messages.ORDER_CANNOT_BE_CANCELLED_AFTER_CANCELLED);
      }

      const updationObject = {
        status: 5,
        cancelled_by: 'customer'
      };

      const updatedOrder = await OrderService.updateOrder(updationObject, { _id: order._id });

      // Send push notification to driver's device
      (async () => {
        const driver = await DriverService.getDriver({ _id: order.driver_id });
        const notification = notificationMessages.orderCancelled({
          orderId: order.order_id
        });

        const notificationPayloadData = {
          type: config.notificationTypes.orderStatusChange,
          createdAt: moment.utc().toISOString(),
          notificationTitle: notification.title,
          notificationBody: notification.body,
          order_id: orderId,
          orderStatus: `${updatedOrder.status}`
        };

        NotificationService.createNotification({
          userId: driver._id,
          data: notificationPayloadData
        });

        PushNotification.notifySingleDevice(
          driver.fcm_token,
          notification,
          notificationPayloadData
        );
      })();


      // Send the mail to customer
      (async () => {
        const customer = await CustomerService.getCustomer({
          _id: mongoose.Types.ObjectId(updatedOrder.customer_id)
        });
        MailerService.sendPlacedOrderToCustomer({
          order,
          customer,
          subject: 'Your Order Is Placed',
          orderStatusString: `Your order has been cancelled with order id ${`${order.order_id}`.toUpperCase()}`
        });
      })();

      return res.status(200).send(ResponseService.success({ order: updatedOrder }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async getStoreswithCustomer(req, res) {
    try {
      const userId = req._userInfo._user_id;
      const stores = await OrderService.getStoreswithCustomer(userId);

      return res.status(200).send(ResponseService.success({ stores }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async getInvoice(req, res) {
    try {
      const orderId = req.params.id;
      if (!orderId) throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);

      if (!HelperService.isValidMongoId(orderId)) throw new apiError.ValidationError('id', messages.ID_INVALID);

      const order = await OrderService.getOrder({ _id: mongoose.Types.ObjectId(orderId) });
      if (!order) throw new apiError.ValidationError('order_id', messages.ORDER_ID_INVALID);

      if (order.status !== 3) throw new apiError.ValidationError('order', messages.ORDER_INVOICE_UNAVAILABLE);

      const customer = await CustomerService.getCustomer({ _id: order.customer_id });
      if (!customer) throw new apiError.InternalServerError();

      const pdf = await InvoiceService.generatePDF(order);

      const mail = await MailerService.sendInvoice(order, customer, pdf);

      return res.status(200).send(ResponseService.success({ mail }));
      // let
      // return res.status(200).send(ResponseService.success());
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async getInvoiceData(req, res) {
    try {
      const orderId = req.params.id;
      if (!orderId) throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);

      if (!HelperService.isValidMongoId(orderId)) throw new apiError.ValidationError('id', messages.ID_INVALID);

      const order = await OrderService.getOrder({ _id: orderId });
      if (!order) throw new apiError.ValidationError('order_id', messages.ORDER_ID_INVALID);

      const customer = await CustomerService.getCustomer({ _id: order.customer_id });
      if (!customer) throw new apiError.InternalServerError();

      const city = await AreaService.getCity({ _id: order.address.delivery.city_id });
      if (!city) throw new apiError.InternalServerError();

      const invoiceNo = HelperService.getInvoiceFromOrder(order.order_id);

      return res.render('layouts/invoice-template', {
        order, customer, moment, city, invoice_no: invoiceNo, config
      });
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  getUserType(url) {
    const type = url.split('/')[2];

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
};
