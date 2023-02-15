const Slot = require('../models/slot');
const schedule = require('node-schedule');
const StoreService = require('./store');
const moment = require('moment-timezone');
const config = require('../config/constants');
const ConfigService = require('./config');

var j;

const slotService = {};
// class SlotService {

    slotService.addSlot = function(details) {
        
        return new Slot(details).save();
    }

    slotService.slotScheduler = async function() {

        var rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 1;

        j = schedule.scheduleJob(rule, async function () {
            await slotService.checkAndAddSlots();
        });
    }

    slotService.cancelScheduler = function() {
        j.cancel();
    }

    slotService.getSlot = function(request) {
        return Slot.findOne(request);
    }

    slotService.getSlots = async function(store_id) {

        // ordersCount: { $lt: Number(config.slots.maximumOrders) },
        let adminConfig = await ConfigService.getConfig();

        let slots = await Slot.find({ 
            store_id: store_id,
            start_time: { $gte: moment().toISOString(), $lt: moment().add(7, 'd').startOf('day').toISOString()},
            ordersCount: { $lt: Number(adminConfig.per_slot_order_limit) }  
        })



        let slotsObject = {};

        for(var i = 0; i < slots.length; i++ ) {
            
            let day = moment(slots[i].start_time).format('YYYY-MM-DD');
            if(!slotsObject[day]) slotsObject[day] = [];

            slotsObject[day].push(slots[i]);
            
        }

        let slotsArray = [];

        for (const key in slotsObject) {
            if (slotsObject.hasOwnProperty(key)) {
                let data = {
                    slots: slotsObject[key],
                    date: key
                }
                slotsArray.push(data)
            }
        }

        slotsArray.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
            });
        
        return slotsArray;
    }
            
    slotService.updateSlot = function (criteria, details) {
        return Slot.findOneAndUpdate(criteria, details, {new: true});
    }

    slotService.getDateSlots = async function(store_id, date) {
        return Slot.find({
            store_id: store_id,
            start_time: { $gte: moment(date).toISOString(), $lt: moment(date).add(1, 'd').startOf('day').toISOString() }  
        })
    }

    slotService.checkAndAddSlots = async function () {

        let stores = await StoreService.getStoresList();
        // console.log('stores', stores);
        let days = config.slots.days;

        for (let i = 0; i < stores.length; i++) {

            let startTime = stores[i].timings.open_time;
            let endTime = stores[i].timings.close_time;

            console.log('startTime', startTime)
            console.log('endTime', endTime)

            let interval = config.slots.eachSlotTime;

            for (let j = 0; j <= days; j++) {

                let slot = await Slot.findOne({

                    start_time: { $gte: moment().add(j, 'd').startOf('day').toISOString(), $lt: moment().add(j + 1, 'd').startOf('day').toISOString() },
                    store_id: stores[i]._id
                })
                if (slot) continue;
                else {

                    console.log(moment().format('YYYY-MM-DD') + ' ' + startTime);

                    let start = moment(moment().format('YYYY-MM-DD') + ' ' + startTime, 'YYYY-MM-DD HH:mm').add(j, 'd')
                    let end = moment(moment().format('YYYY-MM-DD') + ' ' + endTime, 'YYYY-MM-DD HH:mm').add(j, 'd')

                    console.log('start', start.format('YYYY-MM-DD HH:mm'))
                    console.log('end', end.format('YYYY-MM-DD HH:mm'))

                    while (start.isBefore(end) && end.isSameOrAfter(moment(start).add(interval, 'hours'))) {

                        let slot_start = moment(start) //.add(days, 'days');
                        let slot_end = moment(slot_start).add(interval, 'hours');

                        start.add(interval, 'hours');

                        let slotObject = {
                            start_time: slot_start.toISOString(),
                            end_time: slot_end.toISOString(),
                            store_id: stores[i]._id
                        }

                        console.log('start', start.format('YYYY-MM-DD HH:mm'))
                        console.log('end', end.format('YYYY-MM-DD HH:mm'))
                        console.log(start.isBefore(end))

                        // if (start.isAfter(end)) {
                        //     console.log('11111111111111111')
                        //     break;
                        // }; 
                        console.log('------------------------------------------------------------------------------------------------------')
                        console.log(slotObject);
                        console.log('------------------------------------------------------------------------------------------------------')
                        await new Slot(slotObject).save();

                    }

                }

            }

        }

    }

// }

module.exports = slotService;