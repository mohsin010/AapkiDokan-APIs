const OrderService = require('../../services/order');
const CustomerService = require('../../services/customer');
const StoreService = require('../../services/store');
const SlotService = require('../../services/slot');
const ResponseService = require('../../common/response');
const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const fs = require("fs");
const path = require('path');

class CommonController {

    async dashboard(req, res) {

        try {

            let request = Object.assign({}, req.body);
            const type = req._userInfo._user_type;

            console.log('type', type)

            if (!request.from_date) throw new apiError.ValidationError('from_date', messages.FROM_DATE_REQUIRED);
            if (!request.to_date) throw new apiError.ValidationError('from_date', messages.TO_DATE_REQUIRED);


            if (type == 2) {

                let store_id = req._userInfo._user_id;

                let total_orders = await OrderService.getTotalOrdersCount({ store_id });
                let data = await OrderService.getStoreTotalSale(req._userInfo._user_id);
                console.log('data', data)
                let total_sale = data.length > 0 ? data[0].amount : 0;

                let graph_order_date = await OrderService.getGraphOrderDate(request.from_date, request.to_date, store_id);

                let graph_sale_data = await OrderService.getGraphSaleData(request.from_date, request.to_date, store_id);

                return res.status(200).send(ResponseService.success({ total_orders, total_sale, graph_sale_data, graph_order_date }));

            } else {

                let total_orders = await OrderService.getTotalOrdersCount({});
                let total_customers = await CustomerService.getTotalCustomerCount({}, '');
                let total_stores = await StoreService.getTotalStoreCount({});
                let data = await OrderService.getTotalSale();
                let total_sale = data[0].amount;

                let graph_order_date = await OrderService.getGraphOrderDate(request.from_date, request.to_date);

                let graph_sale_data = await OrderService.getGraphSaleData(request.from_date, request.to_date);

                return res.status(200).send(ResponseService.success({ total_orders, total_customers, total_stores, total_sale, graph_sale_data, graph_order_date }));
            }

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }

    }

    async runScheduler(req, res) {

        await SlotService.slotScheduler();
        return res.send(ResponseService.success({ message: 'Scheduler Run' }));
    }

    async manualSlotCreation(req, res) {
        await SlotService.checkAndAddSlots();
        return res.send(ResponseService.success({ message: 'Slot updated Successfully.' }));
    }

    async checkIfFileAlreadyExists(req, res) {

        try {

            let name = req.query.name;
            if (!name) throw new apiError.ValidationError('name', messages.NAME_REQUIRED);

            let filePath = path.resolve('static/uploads/' + name);

            if (fs.existsSync(filePath)) {
                res.send({ success: true })
            } else {
                res.send({ success: false })
            }

        } catch (e) {
            res.send({ success: false })
        }

    }

    async updateStoreInfo(req, res) {
        try {
            const { _userInfo: { _user_id: userId } } = req;
            const criteria = { _id: userId };
            const { storeInfo } = req.body;
            const updatedStore = await StoreService.updateStore({ storeInfo }, criteria);
            return res.send(ResponseService.success({ updatedStore, message: 'Store info has been updated successfully' }));
        } catch (e) {
            return res.send({ success: false })
        }
    }

}

module.exports = new CommonController();