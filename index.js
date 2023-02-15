const server = require('./app')();
const config = require('./config/config');
const slotService = require('./services/slot')

server.create(config);
server.start();
slotService.slotScheduler();