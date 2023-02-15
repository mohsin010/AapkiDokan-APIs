const Area = require('../../models/area');
const City = require('../../models/cities');

class Temp {

    async temp(req, res) {

        try {
            
            let city = await City.find().populate('areas')
            res.send(city);

        } catch (e) {
            console.log('e', e);
        }
    }

}


module.exports = new Temp();