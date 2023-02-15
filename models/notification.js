const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  isRead: {
    type: Boolean,
    required: true,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  data: {
    type: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    notificationTitle: {
      type: String,
      required: true
    },
    notificationBody: {
      type: String,
      required: true
    },
    order_id: {
      type: String,
      required: true
    },
    orderStatus: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Notification', schema);
