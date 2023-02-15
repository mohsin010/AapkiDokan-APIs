const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: true
    },
    contact_number: {
      type: String,
      required: false,
      unique: true
    },

    sku_token: {
      type: String,
      required: false
    },

    timings: {
      open_time: {
        type: String,
        required: true
      },
      close_time: {
        type: String,
        required: true
      }
    },

    address: [{
      shop_no: {
        type: String,
        required: true
      },

      locality: {
        type: String,
        required: true
      },

      area_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true
      },

      city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
      },

      coordinates: {

        latitude: {
          type: Number,
          required: false
        },

        longitude: {
          type: Number,
          required: false
        }
      },

      gps_address: {
        type: String,
        required: false
      },

      unique_link: {
        type: String
      }

    }],
    picture: {
      type: String,
      required: true,
      default: null
    },
    commission: {
      type: Number,
      required: true
    },
    owner: {
      full_name: {
        type: String,
        required: true,
      },
      contact_number: {
        type: String,
        required: true,
        unique: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
    },

    has_express_delivery: {
      type: Boolean,
      default: false
    },

    self_delivery: {
      type: Boolean,
      required: true
    },
    storeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    delivery_charges: [{
      order_amount: {
        type: Number,
        required: true
      },
      charges: {
        type: Number,
        required: true
      }
    }],
    storeInfo: {
      faq: {
        type: String
      },
      termAndCondition: {
        type: String
      },
      privacyAndPolicy: {
        type: String
      },
      contactInfo: {
        type: String
      }
    },
    drivers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    }],

    otp: Number,
    auth_token: String,
    verification_token: String,
    password_reset_token: String,
    status: {
      type: Number,
      enum: [
        1, // Active
        2 // Inactive
      ],
      default: 2
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model('Store', schema);
