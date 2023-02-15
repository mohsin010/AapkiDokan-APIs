const path = require('path').resolve;
const SendOtp = require('sendotp');

const helper = require('../common/helper');
const config = require(path('config/constants'));

const CustomerService = require('../services/customer');
const AuthService = require('../services/auth');
const moment = require('moment-timezone');

const apiError = require('../common/api-errors');
const messages = require('../common/messages');
// Create instance of SendOtp.

const rp = require('request-promise');

class OTPService
{
    async send (contactNumber, type)
    {
        try {

            console.log('contact_number', contactNumber);
            let contact = config.otp.countryCode + contactNumber.slice(-10);
            // let contact = config.otp.countryCode + '3205555903';

            let user = await AuthService.getUser({ contact_number: contactNumber }, type);
            let OTP;
            if(user.otp) {

                let date = moment(user.otp_created);
                date = date.add(config.otp.expiry, 'minutes');

                let current = moment();

                let result = current.isSameOrBefore(date);

                if (result) {

                    OTP = user.otp

                } else {

                    OTP = helper.generateOTP();
                    let updatedUser = await AuthService.updateUser({ otp: OTP, otp_created: moment().toDate() }, { contact_number: contactNumber }, type)
                    if (!updatedUser) throw new apiError.InternalServerError();

                } 

            } else {
                OTP = helper.generateOTP(); 
                let updatedUser = await AuthService.updateUser({ otp: OTP, otp_created: moment().toDate() }, { contact_number: contactNumber }, type)
                if (!updatedUser) throw new apiError.InternalServerError();
            }

            var options = {
                method: 'GET',
                uri: 'http://xxxxxx/api',
                qs: {
                    action: 'sendmessage',
                    username: config.otp.username,
                    password: config.otp.password,
                    originator: config.otp.originator,
                    recipient: contact,
                    messagedata: `${OTP} is your OTP for Aapkidokan Account, Please don't share this with anyone.`
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true

            }

            console.log('options', options);

            let data = await rp(options);

            console.log('data', data);
            

        } catch (error) { console.log(error); }
    }

    async verify (contactNumber, otp, user) 
    {
        try {


            if(otp == user.otp) {

                let date = moment(user.otp_created);
                date = date.add(config.otp.expiry, 'minutes');

                console.log('date', date);

                let current = moment();

                let result = current.isSameOrBefore(date);

                if(result) {

                    return {
                        success: true,
                        message: messages.OTP_VIA_CONTACT_NUMBER
                    }

                } else {
                    return {
                        success: false,
                        message: messages.OTP_EXPIRED
                    }
                }

            } else {
                return {
                    success: false,
                    message: messages.OTP_MISMATCH
                }
            }

            
        } catch (error) {
            return {
                success: false,
                message: messages.OTP_MISMATCH
            } 
        }
    }

}

module.exports = new OTPService();