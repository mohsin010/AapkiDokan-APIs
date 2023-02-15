const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const HelperService = require('./helper');

AWS.config.update({
  accessKeyId: 'xxxxxxxxx',
  secretAccessKey: 'xxxxxxxxxx',
  region: 'us-west-2'
});

const transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: '2010-12-01'
  })
});

const MailerService = {
  async sendContactResponse(name, emailId) {
    try {
      const payload = {
        to: emailId,
        from: 'aapkidokan@gmail.com',
        subject: 'Order Bill',
        html: `<h4>Dear ${name}!</h4><p>Thank You For Contacting Us. We will Get back to you soon.</p><br>`,
      };

      // Mail password to user
      const mailer = await MailerService.sendMail(payload);
      if (mailer.status === false) throw mailer.error;

      return { status: true, data: mailer.data };
    } catch (e) {
      console.log(e);
      return { status: false, error: e };
    }
  },

  async sendPlacedOrderToCustomer({
    order,
    customer,
    subject,
    orderStatusString
  }) {
    try {
      const htmlString = fs.readFileSync(path.join(__dirname, '../views/layouts/order-placed-template.ejs'), { encoding: 'utf8' });
      const html = ejs.render(htmlString, { customer, order, orderStatusString });

      const payload = {
        to: [customer.email, order.address.delivery.email],
        from: 'aapkidokan@gmail.com',
        subject,
        html
      };

      const mailer = await MailerService.sendMail(payload);
      if (mailer.status === false) throw mailer.error;

      return { status: true, data: mailer.data };
    } catch (e) {
      console.log(e);
      return { status: false, error: e };
    }
  },


  async sendInvoice(order, customer, pdf) {
    try {
      const invoiceNo = HelperService.getInvoiceFromOrder(order.order_id);

      const payload = {
        to: [customer.email, order.address.delivery.email],
        from: 'aapkidokan@gmail.com',
        subject: 'Order Invoice',
        html: `<h4>Dear ${customer.full_name}!</h4><p>Here Is your Invoice for the order <strong> #${order.order_id} </strong>.</p><br>`,
        attachments: [
          {
            filename: `${invoiceNo}.pdf`,
            content: Buffer.from(pdf)
          }
        ]
      };

      // Mail password to user
      const mailer = await MailerService.sendMail(payload);
      if (mailer.status === false) throw mailer.error;

      return { status: true, data: mailer.data };
    } catch (e) {
      console.log(e);
      return { status: false, error: e };
    }
  },

  /*
   * Mail function, Expects payload object and users email address as well.
   * Mails user a randomly generated password through which users can log into the app.
   */
  async sendMail(payload) {
    try {
      // Send mail to user
      const mailer = await transporter.sendMail(payload);

      return { status: true, data: mailer };
    } catch (e) {
      console.log(e);
      return { status: false, error: e };
    }
  }
};

module.exports = MailerService;
