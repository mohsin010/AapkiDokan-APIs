const constants = {

  authSecretToken: 'aapkidokan',

  status: { active: 1, inactive: 2, pending: 3 },

  googleClientId: 'xxxxxx',

  facebookAuth: {
    clientId: 'xxx',
    clientSecret: 'xxxxx'
  },

  otp: {

    username: 'aapkidokan_api',
    password: 'xxx',
    originator: '99095',

    authKey: 'xxxx',
    expiry: 5,
    sender: 'DEMOMSG',
    countryCode: 92, // pakistan => 92
  },

  slots: {
    days: 7, // max days for deliver
    eachSlotTime: 2, // hours time for each slot
    maximumOrders: 5
  },

  defaultDeliveryCharges: [
    {
      order_amount: 500,
      charges: 100
    },
    {
      order_amount: 800,
      charges: 50
    },
    {
      order_amount: 1000,
      charges: 50
    }
  ],
  pagination: {
    pageNo: 1,
    perPage: 10
  },

  baseURL: 'http://localhost:5000',

  adminMailRecipients: ['xxxx'],

  mailer: {
    service: 'gmail',
    email: 'xxxxxx',
    password: 'xxxxxx',
    mailFrom: '"Aapki Dokan" <no-reply@aapkidokan.com>'
  },

  // Firebase server configuration
  fcmCreds: {
    databaseUrl: 'https://aapkidokan-xxx.xxxx.com'
  },

  notificationTypes: {
    orderPlace: '1',
    orderStatusChange: '2'
  },

  momentTimezone: 'Asia/Karachi'
  // momentTimezone: "Asia/Karachi"
};

module.exports = constants;
