const SlotService = require('../../services/slot')
const ResponseService = require('../../common/response')
const messages = require('../../common/messages');
const apiError = require('../../common/api-errors');

class SlotController {

    async addSlot(req, res) {

        try {
            console.log('slott add')

            let request = Object.assign({}, req.body);

            // if(request.start_time) throw new apiError.ValidationError('start_time', messages.)

            let slot = await SlotService.addSlot(request);

            return res.send(ResponseService.success({slot}));
            

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }


    }


}

module.exports = new SlotController();