// Bunyan AMQP Stream Transport for ES6
'use strict';

var AMQP = require('amqplib/callback_api');
var Stringify = require('json-stringify-safe');

class BunyanTransport {
  constructor(options) {
    var _this = this;

    this._host = options.host ? options.host : '127.0.0.1';
    this._port = options.port ? options.port : 5672;
    this._vhost = options.vhost ? '/' + options.vhost : '';
    this._exchange = options.exchange ? options.exchange : '';
    this._queue = options.queue ? options.queue : '';
    this._username = options.username;
    this._password = options.password;
    this.levels = { // Translates Bunyan integer to levels to strings to be used as AMQP topics
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal',
    };
    this._transport = new Promise(function(resolve, reject) {
      AMQP.connect(`amqp://${_this._username}:${_this._password}@${_this._host}:${_this._port}${_this._vhost}`, function(error, connection) {
        if (error) reject(error);
        else {
          _this._connection = connection;
          connection.createChannel(function(error, channel) {
            if (error) reject(error);
            else {
              channel.assertExchange(_this._exchange, 'topic', { durable: true });
              channel.assertQueue(_this._queue, { durable: true, exclusive: false }, function(error, queue) {
                if (error) reject(error);
                else {
                  _this._channel = channel;
                  resolve(channel);
                }
              });
            }
          });
        }
      });
    });
  }

  write(message) {
    var _this = this;
    this._transport.then(function(channel) {
      var topics = [message.hostname.replace('.', ':'), message.name.replace('.', ':'), _this.levels[message.level]].join('.');
      channel.publish(_this._exchange, topics, new Buffer(Stringify(message, null, 2)));
    });
  }

  close() {
    this._connection.close();
  }
};

module.exports = function(options) {
  return new BunyanTransport(options);
};
