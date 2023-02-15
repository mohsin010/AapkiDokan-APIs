const moment = require('moment-timezone');
const mongoose = require('mongoose');
const OrderService = require('../../services/order');
const DriverService = require('../../services/driver');
const SlotService = require('../../services/slot');
const StoreService = require('../../services/store');
const NotificationService = require('../../services/notification');
const CustomerService = require('../../services/customer');
const ResponseService = require('../../common/response');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const config = require('../../config/constants');
const PushNotification = require('../../common/push-notification');
const notificationMessages = require('../../common/notification-messages');
const ConfigService = require('../../services/config');
const MailerService = require('../../common/mailer');
const ProductService = require('../../services/product');

const HelperService = require('../../common/helper');



module.exports = {
  async getOrders(req, res) {
    try {
      const pageNo = Number(req.query.pageNo || config.pagination.pageNo);
      const perPage = Number(req.query.perPage || config.pagination.perPage);
      const sort = { [req.query.name]: Number(req.query.sortType) };

      const search = req.query.search || '';

      const condition = {};
      const type = req._userInfo._user_type;
      if (type === 2) condition.store_id = mongoose.Types.ObjectId(req._userInfo._user_id);

      const order = await OrderService.getOrdersWithPagination(
        condition,
        pageNo,
        perPage,
        search,
        sort
      );
      const paginationVariables = {
        pageNo,
        perPage
      };
      const totalItems = await OrderService.getTotalOrdersCountForOrderManagement(
        condition,
        search
      );

      paginationVariables.totalItems = totalItems;

      return res.status(200).send(ResponseService.success({ order, paginationVariables }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async getTodayOrdersCount(req, res) {
    try {
      const condition = {
        created_at: { $gt: moment().startOf('day').toDate(), $lte: moment().endOf('day').toDate() }
      };

      const type = req._userInfo._user_type;
      if (type === 2) condition.store_id = req._userInfo._user_id;

      const ordersCount = await OrderService.getTotalOrdersCount(condition);

      return res.status(200).send(ResponseService.success({ ordersCount }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async updateOrder(req, res) {
    try {
      const request = { ...req.body };
      delete request.created_at;
      delete request.updated_at;
      delete request.store;
      delete request.driver;
      delete request.address.delivery.city;

      request.status = JSON.parse(request.status);

      const { id: orderId } = req.params;

      if (!request.status) throw new apiError.ValidationError('order_details', messages.STATUS_REQUIRED);

      const order = await OrderService.getOrder({ _id: orderId });
      if (!order) throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);

      const type = req._userInfo._user_type;
      if (type === 2) {
        if (request.store_id !== req._userInfo._user_id) throw new apiError.ValidationError('store_id', messages.ID_INVALID);
      }

      if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);

      const store = await StoreService.getStore({ _id: request.store_id });
      if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

      if (!request.slot_id && !request.is_express_delivery) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_REQUIRED);

      if (!store.has_express_delivery && request.is_express_delivery) throw new apiError.ValidationError('express_Delivery', messages.STORE_DOESNT_SUPPORT_EXPRESS_DELIVERY);

      if (request.slot_id) {
        const slot = await SlotService.getSlot({ _id: request.slot_id, store_id: store._id });
        if (!slot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

        if (slot.status === 2) throw new apiError.ValidationError('slot_id', messages.SLOT_INACTIVE);

        request.deliver_start_time = slot.start_time;
        request.deliver_end_time = slot.end_time;
      } else {
        request.deliver_start_time = moment().toISOString();
        request.deliver_end_time = moment().add(2, 'h').toISOString();
        request.is_express_delivery = true;
        request.slot_id = null;
      }

      if (request.driver_id) {
        const driver = await DriverService.getDriver({ _id: request.driver_id });
        if (!driver) throw new apiError.ValidationError('driver_id', messages.DRIVER_ID_REQUIRED);
        request.driver = driver;
      }

      const updateOrder = await OrderService.updateOrder(request, { _id: orderId });

      // send push notification to the driver and the customer
      // if the status of the order has been changed
      if (order.status !== updateOrder.status) {
        (async (orderStatus) => {
          // TODO: Validate that if the status of the order is only unDelivered before
          // then send the push notification
          const customer = await CustomerService.getCustomer({
            _id: mongoose.Types.ObjectId(updateOrder.customer_id)
          });

          const notification = notificationMessages.orderStatusChange({
            orderId: order.order_id,
            status: ((orderStatusInner) => {
              let statusString = '';
              switch (orderStatusInner) {
                case 1:
                  statusString = 'has been placed';
                  break;
                case 2:
                  statusString = 'has been picked up';
                  break;
                case 3:
                  statusString = 'has been delivered';
                  break;
                case 4:
                  statusString = 'is undelivered';
                  break;
                case 5:
                  statusString = 'has been cancelled';
                  break;
                case 6:
                  statusString = 'is ready to deliver';
                  break;
                default:
                  return '';
              }
              return statusString;
            })(orderStatus),
            cancelReason: updateOrder.status === 4 ? updateOrder.undelivered_description : ''
          });

          const notificationPayloadData = {
            type: config.notificationTypes.orderStatusChange,
            createdAt: moment.utc().toISOString(),
            notificationTitle: notification.title,
            notificationBody: notification.body,
            order_id: orderId,
            orderStatus: `${updateOrder.status}`
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

          if (updateOrder.driver_id) {
            const driver = await DriverService.getDriver({
              _id: mongoose.Types.ObjectId(updateOrder.driver_id)
            });

            NotificationService.createNotification({
              userId: driver._id,
              data: notificationPayloadData
            });

            PushNotification.notifySingleDevice(
              driver.fcm_token,
              notification,
              notificationPayloadData
            );
          }

          // Send the mail to customer
          MailerService.sendPlacedOrderToCustomer({
            order: updateOrder,
            customer,
            subject: `Order Status Update for: ${`${order.order_id}`.toUpperCase()}`,
            orderStatusString: notification.body
          });
        })(updateOrder.status);
      }

      if ((order.driver_id || '').toString() !== updateOrder.driver_id.toString()) {
        (async () => {
          // TODO: Validate that if the status of the order is only unDelivered before
          // send the push notification to the driver
          const driver = await DriverService.getDriver({ _id: updateOrder.driver_id });
          const notification = notificationMessages.driverAssigned({
            orderId: updateOrder.order_id
          });

          const notificationPayloadData = {
            type: config.notificationTypes.orderStatusChange,
            createdAt: moment.utc().toISOString(),
            notificationTitle: notification.title,
            notificationBody: notification.body,
            order_id: orderId,
            orderStatus: `${updateOrder.status}`
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
      }

      return res.status(200).send(ResponseService.success({ updateOrder }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  },

  async removeProductFromOrder(req, res) {
    try {
      let request = Object.assign({}, req.body.order);

      // const type = module.exports.getUserType(req.baseUrl);

      let user_id;
      user_id = req._userInfo._user_id;

      let getOldOrder = await OrderService.getOrder({ _id: mongoose.Types.ObjectId(request._id), order_id: request.order_id })

      if (!getOldOrder) {
        throw new apiError.ValidationError('order_id', messages.ORDER_ID_REQUIRED);
      }
      if (getOldOrder.status === 3) {
        throw new apiError.ValidationError('order_id', messages.PRODUCTS_CANNOT_BE_REMOVED_AFTER_DELIVERY);
      }
      if (getOldOrder.products && getOldOrder.products.length < 1 || request.products.length < 1) {
        throw new apiError.ValidationError('order_id', messages.PRODUCTS_CANNOT_BE_REMOVED_THERE_IS_SINGLE_PRODUCT);
      }
      //Old ends
      // new start



      let orderDetails = {};

      let customer = await CustomerService.getCustomer({ _id: mongoose.Types.ObjectId(request.customer_id) });
      if (!customer) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID);

      // if (!request.address_id) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_REQUIRED);
      // if (!request.store_address_id) throw new apiError.ValidationError('store_address_id', messages.ADDRESS_ID_REQUIRED);
      // request.address_id = getOldOrder.address_id
      // request.store_address_id = getOldOrder.store_address_id

      // if (!getOldOrder.address) {
      //   let address = {};

      //   for (let i = 0; i < customer.address.length; i++) {
      //     if (customer.address[i]._id == request.address_id) {
      //       address = customer.address[i];
      //     }
      //   }

      //   if (Object.keys(address).length == 0) throw new apiError.ValidationError('address_id', messages.ADDRESS_ID_INVALID);

      //   orderDetails.address = {};
      //   orderDetails.address.delivery = address;
      // }


      if (!request.store_id) throw new apiError.ValidationError('store_id', messages.STORE_ID_REQUIRED);
      // if (request.store_id != getOldOrder.store_id.toJSON()) throw new apiError.ValidationError('store_id', 'store id is invalid');


      let store = await StoreService.getStore({ _id: getOldOrder.store_id });
      if (!store) throw new apiError.ValidationError('store_id', messages.STORE_ID_INVALID);

      // if (!request.slot_id && !request.is_express_delivery) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_REQUIRED);

      // if (!store.has_express_delivery && request.is_express_delivery) throw new apiError.ValidationError('express_Delivery', messages.STORE_DOESNT_SUPPORT_EXPRESS_DELIVERY)

      let adminConfig = await ConfigService.getConfig();

      // if (request.slot_id) {

      //   let slot = await SlotService.getSlot({ _id: request.slot_id, store_id: store._id });
      //   if (!slot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

      //   if (slot.status == 2) throw new apiError.ValidationError('slot_id', messages.SLOT_INACTIVE)

      //   if (slot.ordersCount >= adminConfig.per_slot_order_limit) throw new apiError.ValidationError('slot', messages.SLOT_FULL)

      //   let slotOrderCount = slot.ordersCount + 1;
      //   let updateSlot = await SlotService.updateSlot({ _id: request.slot_id }, { ordersCount: slotOrderCount })
      //   if (!updateSlot) throw new apiError.ValidationError('slot_id', messages.SLOT_ID_INVALID);

      //   orderDetails.slot_id = request.slot_id;
      //   orderDetails.deliver_start_time = slot.start_time;
      //   orderDetails.deliver_end_time = slot.end_time;

      // } else {

      //   orderDetails.deliver_start_time = moment().toISOString();
      //   orderDetails.deliver_end_time = moment().add(2, 'h').toISOString();
      //   orderDetails.is_express_delivery = true

      // }

      // orderDetails.is_delivered_by_store = store.self_delivery
      // orderDetails.customer_id = user_id;
      // orderDetails.store_id = request.store_id;

      // let flag = false;

      // for (let i = 0; i < store.address.length; i++) {
      //   const element = store.address[i];

      //   if (element._id == request.store_address_id) {
      //     flag = true;

      //     orderDetails.address.pickup = JSON.parse(JSON.stringify(element));
      //     console.log('element', orderDetails.address.pickup);

      //   }
      // }

      // if (!flag) throw new apiError.ValidationError('store_address_id', messages.STORE_ADDRESS_ID_INVALID)

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

        // if (!HelperService.isValidMongoId(product._id)) throw new apiError.ValidationError('id', messages.ID_INVALID)

        let productDetail
        if (product.product_id) {
          productDetail = await ProductService.getProduct({ _id: mongoose.Types.ObjectId(product.product_id), store_id: getOldOrder.store_id });
        } else {
          productDetail = await ProductService.getProduct({ _id: mongoose.Types.ObjectId(product._id), store_id: getOldOrder.store_id });

        }

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
        } else {
          if (getOldOrder.delivery_charges > 0) {
            orderDetails.delivery_charges = 0
          }
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


      let coupon;

      if (getOldOrder.coupon_id) {

        // let check_coupon = await OrderService.getOrder({ customer_id: customer._id, 'coupon._id': mongoose.ObjectId(getOldOrder.coupon_id), store_id: store._id });
        // // console.log('order', order);
        // if (check_coupon) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

        coupon = await CouponService.getCoupon({ _id: getOldOrder.coupon_id });
        if (!coupon || coupon.status == 2) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

        if (coupon.usage < 1) throw new apiError.ValidationError('coupon_id', messages.COUPON_ID_INVALID);

        if (orderDetails.total_amount < coupon.min_order_amount) throw new apiError.ValidationError('coupon_code', `This coupon can only be applied on amount  ${coupon.min_order_amount} PKR or greater`)

        orderDetails.coupon = coupon

        let couponCopy = JSON.parse(JSON.stringify(coupon));

        let value = couponCopy.value;

        // console.log('-------------------------------------', couponCopy)
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
      // console.log(orderDetails.admin_commission_amount)
      orderDetails.store_payout_amount = orderDetails.total_amount_after_tax - (orderDetails.discount || 0) - orderDetails.admin_commission_amount;

      // let uniqueId;

      // // eslint-disable-next-line no-constant-condition
      // while (1) {
      //   uniqueId = cryptoRandomString({ length: 7 });

      //   const order = await OrderService.getOrder({ order_id: uniqueId });
      //   if (!order) break;
      //   // eslint-disable-next-line no-continue
      //   else continue;
      // }
      // orderDetails.order_id = uniqueId.toString();



      // Delete products from order- commented on 16-07-2020
      // const productToBeRemoved = order.products.find(
      //   (product) => product.product_id.toString() === productId
      // );
      // const orderToBeUpdated = {
      //   ...await (async () => {
      //     const adminConfig = await ConfigService.getConfig();
      //     const store = await StoreService.getStore({
      //       _id: mongoose.Types.ObjectId(order.store_id)
      //     });
      //     const { taxes } = adminConfig;

      //     const totalAmount = order.total_amount - (
      //       productToBeRemoved.price * productToBeRemoved.count
      //     );

      //     const { delivery_charges: deliveryCharges } = store;
      //     let orderDeliveryCharges = 0;
      //     deliveryCharges.some((deliveryCharge) => {
      //       if (totalAmount < deliveryCharge.order_amount) {
      //         orderDeliveryCharges = deliveryCharge.charges;
      //         return true;
      //       }
      //       return false;
      //     });

      //     let totalAmountAfterTax = totalAmount;
      //     const orderTaxes = [];

      //     taxes.forEach((tax) => {
      //       const value = (Number(tax.percentage) * totalAmount) / 100;
      //       totalAmountAfterTax += value;
      //       orderTaxes.push({
      //         name: tax.name,
      //         value
      //       });
      //     });

      //     let coupon = null;
      //     let orderDiscount = 0;
      //     if (order.coupon && order.discount > 0) {
      //       const { coupon: innerCoupon } = order;
      //       coupon = totalAmount < innerCoupon.min_order_amount ? null : innerCoupon;
      //       if (coupon) {
      //         if (coupon.type === 1) orderDiscount = coupon.value;
      //         else orderDiscount = (coupon.value * totalAmount) / 100;
      //       }
      //     }

      //     const afterDiscountPrice = totalAmount - (orderDiscount || 0);
      //     const adminCommissionAmount = (
      //       order.commission_percentage * afterDiscountPrice
      //     ) / 100;
      //     const storePayoutAmount = totalAmountAfterTax
      //       - (orderDiscount || 0)
      //       - adminCommissionAmount;

      //     return {
      //       admin_commission_amount: adminCommissionAmount,
      //       coupon,
      //       delivery_charges: orderDeliveryCharges,
      //       discount: orderDiscount,
      //       store_payout_amount: storePayoutAmount,
      //       taxes: orderTaxes,
      //       total_amount_after_tax: totalAmountAfterTax,
      //       total_amount: totalAmount
      //     };
      //   })(),
      // };
      // const updatedOrder = await OrderService.updateOrder({
      //   ...orderToBeUpdated,
      //   $pull: { products: { product_id: productId } }
      // }, { _id: mongoose.Types.ObjectId(orderId) });

      // const store = await StoreService.getStore({
      //   _id: mongoose.Types.ObjectId(updatedOrder.store_id)
      // });
      // updatedOrder.store = store;
      // mee
      const updatedOrder = await OrderService.updateOrder(orderDetails, { _id: getOldOrder._id })
      // let abc = "mohsin"
      // console.log(orderDetails)
      // debugger
      // Send the mail to customer
      // (async () => {
      //   try {
      // let customer1 = await CustomerService.getCustomer({
      //   _id: mongoose.Types.ObjectId(updatedOrder.customer_id)
      // });
      MailerService.sendPlacedOrderToCustomer({
        order: updatedOrder,
        customer,
        subject: `Order Status Update for: ${`${request.order_id}`.toUpperCase()}`,
        orderStatusString: 'Your order has been updated as per your request'
      });
      //   } catch (e) {
      //     console.log(e)
      //   }

      // })(updatedOrder.status);

      return res.status(200).send(ResponseService.success({ order: updatedOrder }));
    } catch (e) {
      return res.status(500).send(ResponseService.failure(e));
    }
  }
};
