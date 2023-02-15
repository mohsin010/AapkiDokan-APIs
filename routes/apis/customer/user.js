const express = require('express');

const router = express.Router();
const jwtAuth = require('../../../middlewares/jwt-auth');
const path = require('path').resolve;

const UserController = require('../../../controllers/customer/user');

const UserUpload = require(path('common/user-multer'));

router.get('/address', jwtAuth, UserController.getAddress.bind(UserController));

/**
 * @api {get} /api/customer/user/address Get Addresses
 * @apiName Get Addresses
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "address": [
 *             {
 *                 "_id": "5ced0d960945c93eb129d2f5",
 *                 "house_no": "123",
 *                 "locality": "xyz colony",
 *                 "city_id": "5cd01c1839b32d325085052d",
 *                 "alias": "home",
 *                 "landmark": "xyz park",
 *                 "email": "test@gmail.com",
 *                 "contact_number": "9711669906"
 *             }
 *         ]
 *     }
 * }
 *
 * @apiError ValidationError Auth Token is invalid.
 *
 * @apiErrorExample Auth token is invalid:
 * {
 *     "success": false,
 *     "error": 401
 * }
 */

router.post('/address', jwtAuth, UserController.addAddress.bind(UserController));

/**
 * @api {post} /api/customer/user/address Add Address
 * @apiName Add Address
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 * @apiParam {String} locality user's locality address.
 * @apiParam {String} house_no house number .
 * @apiParam {String} email email for this address .
 * @apiParam {String} contact_number contact number for this address .
 * @apiParam {String} landmark (optional) Landmark for this address .
 * @apiParam {String} city_id City Id of the address .
 * @apiParam {String} alias alias name for address.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "customer": {
 *             "picture": null,
 *             "gmail_id": null,
 *             "facebook_id": null,
 *             "status": 1,
 *             "_id": "5ce7f068b9c00379c7d8564b",
 *             "email": "test@aapkidokan.com",
 *             "contact_number": "9711669906",
 *             "full_name": "test",
 *             "password": "$2b$10$ooranEJziyIxjfLLprkIVuVjjBhRfZ72DXqlhGNk4K2CyziGfQ/MC",
 *             "verification_token": "b7274e6b-690b-46da-9dda-631d013743e2",
 *             "address": [
 *                 {
 *                     "_id": "5ced0d960945c93eb129d2f5",
 *                     "house_no": "123",
 *                     "locality": "xyz colony",
 *                     "city_id": "5cd01c1839b32d325085052d",
 *                     "alias": "home",
 *                     "landmark": "xyz park",
 *                     "email": "test@gmail.com",
 *                     "contact_number": "9711669906"
 *                 }
 *             ],
 *             "created_at": "2019-05-24T13:23:52.522Z",
 *             "updated_at": "2019-05-28T10:29:42.517Z",
 *             "__v": 0
 *         }
 *     }
 * }
 *
 * @apiError ValidationError House no is Required.
 *
 * @apiErrorExample House no is Required:
 * {
 *     "success": false,
 *     "code": {
 *         "code": 422,
 *         "name": "UNPROCESSABLE_ENTITY",
 *         "description": "Validation failed. The request and the format is valid, however the request was unable to process. For instance when sent data does not pass validation tests."
 *     },
 *     "singleStringMessage": "House No. is a required field",
 *     "error": {
 *         "validation": {
 *             "house_no": [
 *                 "House No. is a required field"
 *             ]
 *         }
 *     }
 * }
 */

router.put('/address/:id', jwtAuth, UserController.updateAddress.bind(UserController));

/**
 * @api {put} /api/customer/user/address/:id Update Address
 * @apiName Update Address
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 * @apiParam (Params) {String} id Id of the Address to be updated
 *
 * @apiParam {String} locality user's locality address.
 * @apiParam {String} house_no house number .
 * @apiParam {String} email email for this address .
 * @apiParam {String} contact_number contact number for this address .
 * @apiParam {String} landmark (optional) Landmark for this address .
 * @apiParam {String} city_id City Id of the address .
 * @apiParam {String} alias alias name for address.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "customer": {
 *             "picture": null,
 *             "gmail_id": null,
 *             "facebook_id": null,
 *             "status": 1,
 *             "_id": "5ce7f068b9c00379c7d8564b",
 *             "email": "test@aapkidokan.com",
 *             "contact_number": "9711669906",
 *             "full_name": "test",
 *             "password": "$2b$10$ooranEJziyIxjfLLprkIVuVjjBhRfZ72DXqlhGNk4K2CyziGfQ/MC",
 *             "verification_token": "b7274e6b-690b-46da-9dda-631d013743e2",
 *             "address": [
 *                 {
 *                     "_id": "5ced0d960945c93eb129d2f5",
 *                     "house_no": "123",
 *                     "locality": "xyz colony",
 *                     "city_id": "5cd01c1839b32d325085052d",
 *                     "alias": "home",
 *                     "landmark": "xyz park",
 *                     "email": "test@gmail.com",
 *                     "contact_number": "9711669906"
 *                 }
 *             ],
 *             "created_at": "2019-05-24T13:23:52.522Z",
 *             "updated_at": "2019-05-28T10:29:42.517Z",
 *             "__v": 0
 *         }
 *     }
 * }
 *
 * @apiError ValidationError House no is Required.
 *
 * @apiErrorExample House no is Required:
 * {
 *     "success": false,
 *     "code": {
 *         "code": 422,
 *         "name": "UNPROCESSABLE_ENTITY",
 *         "description": "Validation failed. The request and the format is valid, however the request was unable to process. For instance when sent data does not pass validation tests."
 *     },
 *     "singleStringMessage": "House No. is a required field",
 *     "error": {
 *         "validation": {
 *             "house_no": [
 *                 "House No. is a required field"
 *             ]
 *         }
 *     }
 * }
 */

router.delete('/address/:id', jwtAuth, UserController.deleteAddress.bind(UserController));
/**
 * @api {delete} /api/customer/user/address/:id Delete Address
 * @apiName Delete Address
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 * @apiParam (Params) {String} id Id of the Address to be deleted
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "customer": {
 *             "picture": null,
 *             "gmail_id": null,
 *             "facebook_id": null,
 *             "status": 1,
 *             "_id": "5ce7f068b9c00379c7d8564b",
 *             "email": "test@aapkidokan.com",
 *             "contact_number": "9711669906",
 *             "full_name": "test",
 *             "password": "$2b$10$ooranEJziyIxjfLLprkIVuVjjBhRfZ72DXqlhGNk4K2CyziGfQ/MC",
 *             "verification_token": "b7274e6b-690b-46da-9dda-631d013743e2",
 *             "address": [
 *                 {
 *                     "_id": "5ced0d960945c93eb129d2f5",
 *                     "house_no": "123",
 *                     "locality": "xyz colony",
 *                     "city_id": "5cd01c1839b32d325085052d",
 *                     "alias": "home",
 *                     "landmark": "xyz park",
 *                     "email": "test@gmail.com",
 *                     "contact_number": "9711669906"
 *                 }
 *             ],
 *             "created_at": "2019-05-24T13:23:52.522Z",
 *             "updated_at": "2019-05-28T10:29:42.517Z",
 *             "__v": 0
 *         }
 *     }
 * }
 *
 */


router.get('/profile', jwtAuth, UserController.getProfile);

/**
 * @api {get} /api/customer/user/profile Get Profile
 * @apiName Get Profile
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "customer": {
 *             "picture": "ivvf6tmjwrhh057.png",
 *             "gmail_id": null,
 *             "facebook_id": null,
 *             "status": 1,
 *             "_id": "5cf609a8a460b46232cb3e41",
 *             "email": "test@aapkidokan.com",
 *             "password": "$2b$10$PqV6nF6Sp36ZjAmgWGU97OEQmfVgVGmF3XBJKeQUzarzAkbKrFJ0y",
 *             "full_name": "test 1",
 *             "contact_number": "9711669906",
 *             "verification_token": null,
 *             "address": [],
 *             "created_at": "2019-06-04T06:03:20.802Z",
 *             "updated_at": "2019-06-11T07:28:06.505Z",
 *             "__v": 0
 *         }
 *     }
 * }
 *
 */

router.put('/profile/:id', jwtAuth, UserUpload.any(), UserController.updateProfile);
/**
 * @api {put} /api/customer/user/profile/:id Update Profile
 * @apiName Update Profile
 * @apiGroup Customer-User
 *
 * @apiHeader {String} Authorization 'Bearer' + user token
 *
 * @apiParam (Params) {String} id Id of the User to be updated
 *
 * @apiParam (Body) {String} full_name (optional) name of the user.
 * @apiParam (Body) {File} picture (optional) Profile Picture .
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *     "success": true,
 *     "code": 200,
 *     "data": {
 *         "customer": {
 *             "picture": null,
 *             "gmail_id": null,
 *             "facebook_id": null,
 *             "status": 1,
 *             "_id": "5ce7f068b9c00379c7d8564b",
 *             "email": "test@aapkidokan.com",
 *             "contact_number": "9711669906",
 *             "full_name": "test",
 *             "password": "$2b$10$ooranEJziyIxjfLLprkIVuVjjBhRfZ72DXqlhGNk4K2CyziGfQ/MC",
 *             "verification_token": "b7274e6b-690b-46da-9dda-631d013743e2",
 *             "address": [
 *                 {
 *                     "_id": "5ced0d960945c93eb129d2f5",
 *                     "house_no": "123",
 *                     "locality": "xyz colony",
 *                     "city_id": "5cd01c1839b32d325085052d",
 *                     "alias": "home",
 *                     "landmark": "xyz park",
 *                     "email": "test@gmail.com",
 *                     "contact_number": "9711669906"
 *                 }
 *             ],
 *             "created_at": "2019-05-24T13:23:52.522Z",
 *             "updated_at": "2019-05-28T10:29:42.517Z",
 *             "__v": 0
 *         }
 *     }
 * }
 *
 * @apiError ValidationError Auth Token is Invalid.
 *
 * @apiErrorExample Auth Token is Invalid:
 * {
 *     "success": false,
 *     "code": {
 *         "code": 422,
 *         "name": "UNPROCESSABLE_ENTITY",
 *         "description": "Validation failed. The request and the format is valid, however the request was unable to process. For instance when sent data does not pass validation tests."
 *     },
 *     "singleStringMessage": "Authentication token is invalid",
 *     "error": {
 *         "validation": {
 *             "token": [
 *                 "Authentication token is invalid"
 *             ]
 *         }
 *     }
 * }
 */

router.get('/slot-mgmt', UserController.addSlot);

router.post('/fcm-token', jwtAuth, UserController.addFcmToken);

module.exports = router;
