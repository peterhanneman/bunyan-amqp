// Bunyan AMQP Stream Transport

var AMQP = require('amqplib/callback_api');
var Bluebird = require('bluebird');
var Format = require('util').format;
var Stringify = require('json-stringify-safe');


var BunyanAMQP = function(options) {
  var self = this;

  this._host = options.host ? options.host : '127.0.0.1';
  this._port = options.port ? options.port : 5672;
  this._vhost = options.vhost ? '/' + options.vhost : '';
  this._exchange = options.exchange ? options.exchange : '';
  this._queue = options.queue ? options.queue : '';
  this._username = options.username;
  this._password = options.password;
  this.levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
  };
  this._transport = new Bluebird(function(resolve, reject) {
    AMQP.connect(Format('amqp://%s:%s@%s:%d%s', self._username, self._password, self._host, self._port, self._vhost), function(error, connection) {
      if (error) reject(error);
      else {
        self._connection = connection;
        connection.createChannel(function(error, channel) {
          if (error) reject(error);
          else {
            channel.assertExchange(self._exchange, 'topic', { durable: true });
            channel.assertQueue(self._queue, { exclusive: false, durable: true }, function(error, q) {
              if (error) reject(error);
              else {
                self._channel = channel;
                resolve(self._channel);
              }
            });
          }
        });
      }
    });
  })
  .catch(function(error) {
    throw new Error(error);
  });
};


BunyanAMQP.prototype.write = function write(message) {
  var self = this;
  this._transport.then(function(channel) {
    var topics = [message.hostname.replace('.', ':'), message.name.replace('.', ':'), self.levels[message.level]].join('.');
    message = Stringify(message, null, 2);
    channel.publish(self._exchange, topics, new Buffer(message));
  });
};


BunyanAMQP.prototype.close = function close() {
  this._connection.close();
};


module.exports = BunyanAMQP;
