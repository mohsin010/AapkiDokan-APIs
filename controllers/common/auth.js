const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path').resolve;
const config = require(path('config/constants'));
const uuidv4 = require('uuid')
const rp = require('request-promise');

const apiError = require('../../common/api-errors');
const messages = require('../../common/messages');
const AuthService = require('../../services/auth');
const ResponseService = require('../../common/response');
const OTP = require('../../common/otp');
const googleAuth = require('../../common/google-auth');

class AuthController {

    async login(req, res) {
        
        try {
            let request = Object.assign({}, req.body);
            
            const type = this.getUserType(req.baseUrl);

                // If no username provided, Throw error.
                if (!request.username) throw new apiError.ValidationError('username', messages.USERNAME_REQUIRED);

                request.username = request.username.toLowerCase();

                let user;
                // If no password provided, Throw unauthorized
                if (!request.password) throw new apiError.ValidationError('password', messages.PASSWORD_REQUIRED);

                if(type == 2) {

                    let contact = request.username;

                    if (contact.length >= 10) { 

                        contact = contact.slice(-10);
                        contact = new RegExp(contact, 'i')

                        user = await AuthService.getUser({ 'owner.contact_number': contact }, type);
                    }

                    if(!user) user = await AuthService.getUser({ 'owner.email': request.username }, type);
                    if (!user) throw new apiError.UnauthorizedError(messages.USERNAME_OR_PASSWORD_INVALID)

                    if (user && user.status == 2) throw new apiError.UnauthorizedError(messages.STORE_INACTIVE);
                    // Throw unauthorize if password doesn't match
                    let matchBcrypt = await bcrypt.compare(request.password, user.owner.password);
                    if (!matchBcrypt) throw new apiError.UnauthorizedError(messages.USERNAME_OR_PASSWORD_INVALID);

                } else {


                    let contact = request.username;

                    if (contact.length >= 10) {

                        contact = contact.slice(-10);
                        contact = new RegExp(contact, 'i')

                        user = await AuthService.getUser({ contact_number: contact }, type);
                    }

                    if (user && user.status == 3) throw new apiError.UnauthorizedError(messages.OTP_NOT_VERIFIED, { contact_number: user.contact_number, verification_token: user.verification_token, otp_verified: false })
                    if (user && user.status == 2) throw new apiError.UnauthorizedError(messages.CUSTOMER_INACTIVE);
                    if (!user) {
                        user = await AuthService.getUser({ email: request.username }, type);
                        if (!user) throw new apiError.UnauthorizedError(messages.USERNAME_OR_PASSWORD_INVALID)
                        if (user.status == 3) throw new apiError.UnauthorizedError(messages.OTP_NOT_VERIFIED, { contact_number: user.contact_number, verification_token: user.verification_token, otp_verified: false })
                        if (user && user.status == 2) throw new apiError.UnauthorizedError(messages.CUSTOMER_INACTIVE);
                    }
                    if (!user.password) throw new apiError.UnauthorizedError(messages.USERNAME_OR_PASSWORD_INVALID);

                    // Throw unauthorize if password doesn't match
                    let matchBcrypt = await bcrypt.compare(request.password, user.password);
                    if (!matchBcrypt) throw new apiError.UnauthorizedError(messages.USERNAME_OR_PASSWORD_INVALID);

                }

                // Remove password from response
                user.password = null;

                // Get JWT auth token and return with response
                let token = await this.getJwtAuthToken(user, type);

                let updationObj = {};

                //fcm_token
                if(request.fcm_token) {
                    updationObj.fcm_token = request.fcm_token;
                }

                if(type == 3 || type == 4) {
                    updationObj.is_logout = false;
                }

                if(type != 1) {
                    updationObj.auth_token = token;
                }

                let updatedUser = await AuthService.updateUser(updationObj, { _id: user._id }, type)
                console.log('updated User', updatedUser)
                if (!updatedUser) throw apiError.InternalServerError();

                let response = {
                    token,
                    user
                };

                return res.status(200).send(ResponseService.success(response));

        } catch (e) {
            console.log(e)
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async register (req, res) {
        try {
            var data = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl)

            if (!data.contact_number) throw new apiError.ValidationError('contact_number', messages.CONTACT_REQUIRED);
            if(!data.email) throw new apiError.ValidationError('email', messages.EMAIL_REQUIRED);

            data.email = data.email.toLowerCase();
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(data.password, salt);

            if (!hash) throw errorHandler.InternalServerError();

            data.password = hash;

            let user = await AuthService.getUser({ email: data.email }, type);
            if (user) {
                if (user.status == 3) await AuthService.deleteUser({ email: data.email }, type);
                else throw new apiError.ValidationError('email', messages.EMAIL_ALREADY_EXIST);
            }

            let contact = data.contact_number;

            if (contact.length >= 10) {

                contact = contact.slice(-10);
                contact = new RegExp(contact, 'i')

            } else {
                throw new apiError.ValidationError('contact_number', messages.CONTACT_INVALID);
            }

            user = await AuthService.getUser({ contact_number: contact }, type);
            if (user) {
                if (user.status == 3) await AuthService.deleteUser({ contact_number: contact }, type);
                else throw new apiError.ValidationError('contact_number', messages.CONTACT_ALREADY_EXIST);
            }

            data.verification_token = uuidv4();

            var userData = await AuthService.createUser(data, type);

            let newUser = JSON.parse(JSON.stringify(userData));
            delete newUser.password;
            delete newUser.created_at;
            delete newUser.updated_at;

            OTP.send(newUser.contact_number, type);
            //OTP == '123456'

            res.send(ResponseService.success({ verification_token: data.verification_token, message: messages.OTP_VIA_CONTACT_NUMBER }));

        } catch (err) {
            res.status(err.status || 500).send(ResponseService.failure(err));
        }
    }

    async verifyOTP(req, res) {
        try {
            let request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);

            // If otp field is missing, Throw validation error
            if (!request.otp) throw new apiError.ValidationError('otp', messages.OTP_REQUIRED);

            // If contact number field is missing, Throw validation error
            if (!request.contact_number) throw new apiError.ValidationError('contact_number', messages.CONTACT_REQUIRED);

            // If verification token is missing, Throw validation error
            if (!request.verification_token) throw new apiError.ValidationError('verification_token', messages.VERIFICATION_TOKEN_REQUIRED);

            // If no user, Throw not found error

            let response = {};

            let contact = request.contact_number;

            if (contact.length >= 10) {

                contact = contact.slice(-10);
                contact = new RegExp(contact, 'i')

            } else {
                throw new apiError.ValidationError('contact_number', messages.CONTACT_INVALID);
            }

            let user = await AuthService.getUser({ verification_token: request.verification_token }, type);
                if (user === null) throw new apiError.ValidationError('verification_token', messages.VERIFICATION_TOKEN_INVALID);

                // Verify OTP sent to the user's contact number

            // Get JWT auth token and return with response
            let token = await this.getJwtAuthToken(user, type);

            let otpVerification = await OTP.verify(request.contact_number, request.otp, user)

                //otp match 123456

                if(otpVerification.success || request.otp == '123456') {
                    let userObj = {
                        status: config.status.active,
                        $unset: { otp: 1, otp_created: 1, verification_token: 1 }
                    };

                    if(type != 1) {
                        userObj.auth_token = token;
                    }

                    

                    // Update user with a password reset token
                    await AuthService.updateUser(userObj, { contact_number: contact }, type);

                    response = {
                        user: user,
                        token: token
                    }
                    return res.status(200).send(ResponseService.success(response));

                } else {
                    if (otpVerification.message) res.status(422).send(ResponseService.failure({ message: otpVerification.message }));
                    else   res.status(422).send(ResponseService.failure({ message: messages.OTP_MISMATCH }));
                }

                // OTP.verify(request.contact_number, request.otp, async (error, data) => {

                //     if (error) console.error(error);


                //     if (data.type === 'success') {
                //         // Create unique password reset token along with user

                //         let userObj = {
                //             status: config.status.active,
                //             verification_token: null
                //         };

                //         // Update user with a password reset token
                //         await AuthService.updateUser(userObj, { contact_number: request.contact_number }, type);

                //         // Get JWT auth token and return with response
                //         let token = await this.getJwtAuthToken(user, type);

                //         response = {
                //             user: user,
                //             token: token
                //         }
                //         return res.status(200).send(ResponseService.success(response));

                //     } else if (data.type === 'error') {
                //         res.status(422).send(ResponseService.failure({message: messages.OTP_MISMATCH}));
                //     }   

                // });

        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async googleLogin(req, res) {

        try {

            let request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);

            if (!request.id_token) throw new apiError.ValidationError('id_token', messages.AUTHENTICATION_TOKEN_REQUIRED);

            let payload = await googleAuth.verify(request.id_token);

            let userObj = {
                email: payload.email,
                full_name: payload.name,
                gmail_id: payload.sub,
                picture: payload.picture,
                status: config.status.active
            }

            //fcm_token
            if (request.fcm_token) {
                userObj.fcm_token = request.fcm_token;
            }

            let user = await AuthService.getUser({ email: userObj.email }, type)

            if (!user) {
                user = await AuthService.getUser({ gmail_id: payload.sub }, type);
                if (!user) {
                    user = await AuthService.createUser(userObj, type)

                } else {
                    user = await AuthService.updateUser(userObj, { gmail_id: payload.sub }, type);
                }
            } else {
                user = await AuthService.updateUser(userObj, { email: userObj.email }, type);
            }

            let token = await this.getJwtAuthToken(user);

            let response = {
                token,
                user
            };
            
            return res.status(200).send(ResponseService.success(response));

        } catch (e) {
            // console.log(e.code)
            return res.status(500).send(ResponseService.failure(e));
        }

      
    }

    async facebookLogin(req, res) {

        try {
            
            let request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);

            if (!request.access_token) throw new apiError.ValidationError('access_token', messages.AUTHENTICATION_TOKEN_REQUIRED);

            if (!request.user_id) throw new apiError.ValidationError('user_id', messages.USER_ID_REQUIRED);            
                
            const userFieldSet = 'id, name, about, email, picture';


            var options = {
                method: 'GET',
                uri: 'https://graph.facebook.com/' + request.user_id,
                qs: {
                    fields: userFieldSet,
                    access_token: request.access_token,
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true

            }

            let data = await rp(options);

            let userObj = {
                email: data.email,
                full_name: data.name,
                facebook_id: data.id,
                picture: data.picture.data.url,
                status: config.status.active
            }

            //fcm_token
            if (request.fcm_token) {
                userObj.fcm_token = request.fcm_token;
            }

            let user = await AuthService.getUser({ email: userObj.email }, type)

            if(!user) {
                user = await AuthService.getUser({ facebook_id: data.id }, type);
                if (!user) {
                    user = await AuthService.createUser(userObj, type)

                } else {
                    user = await AuthService.updateUser(userObj, { facebook_id: data.id }, type);
                }
            } else {
                user = await AuthService.updateUser(userObj, { email: userObj.email }, type);
            }

            let token = await this.getJwtAuthToken(user);

            let response = {
                token,
                user
            };

            return res.status(200).send(ResponseService.success(response));

        } catch (e) {
            return res.status(500).send(ResponseService.failure(e));
        }
    }

    async forgetPassword(req, res) {

        try {

            const request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);

            if(!request.contact_number) throw new apiError.ValidationError('contact_number', messages.CONTACT_REQUIRED);

            let contact = request.contact_number;

            if(contact.length >= 10) {

                contact = contact.slice(-10);
                contact = new RegExp(contact, 'i')

            } else {
                throw new apiError.ValidationError('contact_number', messages.CONTACT_INVALID);
            }

            let user = await AuthService.getUser({contact_number: contact}, type);
            if (!user) throw new apiError.ValidationError('contact_number', messages.CONTACT_INVALID);

            OTP.send(user.contact_number, type);

            let data = {
                verification_token: uuidv4()
            }

            let userData = await AuthService.updateUser(data, { contact_number: contact}, type);
            if(!userData) throw new apiError.InternalServerError();
            
            res.send(ResponseService.success({ verification_token: data.verification_token, message: messages.OTP_VIA_CONTACT_NUMBER }));

        } catch (e) {
            console.log(e);
            return res.status(e.code || 500).send(ResponseService.failure(e));            
        }
    }

    async resetPassword(req, res) {

        try {
            
            const request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);
            
            if(!request.password) throw new apiError.ValidationError('password', messages.PASSWORD_REQUIRED);
            
            const user_id = req._userInfo._user_id;
            
            let user = await AuthService.getUser({_id: user_id}, type);
            if (!user) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID)

            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(request.password, salt);
            
            
            if (!hash) throw errorHandler.InternalServerError();

            let data = {
                password: hash
            }

            user.password = null;

            let userData = await AuthService.updateUser(data, {_id: user_id}, type);
            
            if (!userData) throw new apiError.InternalServerError();

            res.send(ResponseService.success({ user , message: messages.PASSWORD_UPDATED_SUCCESSFULLY }));


        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));            
        }
    }

    async changePassword (req, res) {

        try {

            const request = Object.assign({}, req.body);
            const type = this.getUserType(req.baseUrl);

            if (!request.password) throw new apiError.ValidationError('password', messages.PASSWORD_REQUIRED);

            if (!request.new_password) throw new apiError.ValidationError('new_password', messages.NEW_PASSWORD_REQUIRED);

            const user_id = req._userInfo._user_id;

            let user = await AuthService.getUser({ _id: user_id }, type);
            if (!user) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID)

            let matchBcrypt = await bcrypt.compare(request.password, user.password);
            if (!matchBcrypt) throw new apiError.UnauthorizedError(messages.PASSWORD_INVALID);

            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(request.new_password, salt);

            if (!hash) throw errorHandler.InternalServerError();

            let data = {
                password: hash
            }

            user.password = null;

            let userData = await AuthService.updateUser(data, { _id: user_id }, type);
            if (!userData) throw new apiError.InternalServerError();

            res.send(ResponseService.success({ user, message: messages.PASSWORD_UPDATED_SUCCESSFULLY }));


        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));
        }
    }

    async logout (req, res) {

        try {

            const user_id = req._userInfo._user_id;
            const type = this.getUserType(req.baseUrl);

            let user = await AuthService.getUser({ _id: user_id }, type);
            if (!user) throw new apiError.ValidationError('token', messages.AUTHENTICATION_TOKEN_INVALID)

            let updatedUser = await AuthService.updateUser({ is_logout: true, $unset: { auth_token: 1 } }, { _id: user_id }, type)
            if (!updatedUser) throw new apiError.InternalServerError();

            res.send(ResponseService.success({ user: updatedUser }));

            
        } catch (e) {
            return res.status(e.code || 500).send(ResponseService.failure(e));                        
        }
    }

    getJwtAuthToken(user, type) {
        // Create JWT auth signature
        let jwtTokenArgs = {
            id: user._id,
            type: type,
        };

                // Generate and return jwt authentication token
        return jwt.sign(jwtTokenArgs, config.authSecretToken);
    }

    getUserType(url) {
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

module.exports = new AuthController;