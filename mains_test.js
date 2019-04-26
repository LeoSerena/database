const test_connection = require('./test_connection.js');
const events = require('events');

eventEmitter = new events.EventEmitter();
eventEmitter.on('error', function(error){
  console.log(error);
})
eventEmitter.on('data_recieved', function(result){
  console.log(result);
})

module.exports = {
    eventEmitter : eventEmitter
}

test_connection.test_connection();

