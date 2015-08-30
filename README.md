bunyan-amqp
====================

AMQP 0.9.1 compatible transport stream for use with Bunyan.  Intended to be used with a "topic" exchange.  Where the hostname becomes the first topic, the name of the Bunyan logger application is used as the secondary topic followed by the string log level.  Ex: "My-MacbookPro.AppName.info".  Has only been tested with RabbitMQ thus far.

This package was created to support an internal company project but I promise that I will update the docs ASAP for public consumption!


```
var BunyanAMQP = require('bunyan-amqp');
var bunyanAMQP = new BunyanAMQP({
  host: '127.0.0.1',
  port: 5672,
  vhost: 'logger',
  exchange: 'exchangeName',
  queue: 'queueName',
  username: 'username',
  password: 'password'
});

var Log = require('bunyan').createLogger({
  name: 'AppName',
  streams: [
    {
      stream: process.stdout,
      level: 'trace'
    },
    {
      type: 'raw',
      level: 'debug',
      stream: bunyanAMQP
    }
  ]
});

var ChildLog = Log.child({ module: 'Sub-module of AppName' })

Log.info('Testing info level...');
Log.debug('Testing debug level...');
Log.fatal('Testing fatal level...');

ChildLog.info('Testing child info level...');
ChildLog.debug('Testing child debug level...');
ChildLog.fata('Testing child fatal level...');
```
