// Bunyan AMQP Stream Transport

var amqp = require('amqplib/callback_api');
var bluebird = require('bluebird');
var format = require('util').format;
var stream = require('stream');
var stringify = require('json-stringify-safe');


var BunyanAMQP = function(options) {
  var self = this;

  this._host = options.host ? options.host : 'localhost';
  this._port = options.port ? options.port : 5672;
  this._exchange = options.exchange ? options.exchange : '';
  this._queue = options.queue ? options.queue : '';
  this._topics = options.topics ? options.topics.join('.') : '';
  this._username = options.username;
  this._password = options.password;
  this._transport = new bluebird(function(resolve, reject) {
    amqp.connect(format('amqp://%s:%s@%s:%d', self._username, self._password, self._host, self._port), function(error, connection) {
      if (error) reject(error);
      self._connection = connection;
      connection.createChannel(function(error, channel) {
        if (error) reject(error);
        channel.assertExchange(self._exchange, 'topic', { durable: true });
        channel.assertQueue(self._queue, { exclusive: false, durable: true }, function(error, q) {
          if (error) reject(error);
          self._channel = channel;
          resolve(self._channel);
        });
      });
    });
  });
  this.levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
  };
};


BunyanAMQP.prototype.write = function write(message) {
  var self = this;
  this._transport.then(function(channel) {
    var topics = self._topics + '.' + self.levels[message.level];
    message = stringify(message, null, 2);
    channel.publish(self._exchange, topics, new Buffer(message));
    // console.log('%s/%s[%s]: %s', self._exchange, self._queue, topics, message);
  });
};


BunyanAMQP.prototype.close = function close() {
  this._connection.close();
};


module.exports = BunyanAMQP;
