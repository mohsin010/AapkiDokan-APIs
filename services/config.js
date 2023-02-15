const Config = require('../models/config');

module.exports = {
  addConfig(config) {
    return new Config(config).save();
  },

  getConfig() {
    return Config.findOne({});
  },

  updateConfig(details) {
    return Config.findOneAndUpdate({}, details, { new: true });
  }
};
