bunyan-amqp
====================

AMQP 0.9.1 compatible transport stream for use with Bunyan.  Uses "topic" configuration.  Has only been tested with RabbitMQ thus far.

This package was created to support an internal company project but I promise that I will update the docs ASAP for public consumption!


```
var BunyanAMQP = require('bunyan-amqp');
var bunyanAMQP = new BunyanAMQP({
  host: 'localhost',
  port: 5672,
  exchange: 'exchange-name',
  queue: 'queue-name',
  username: 'test',
  password: 'test',
  topics: ['PrimaryTopic', 'SecondaryTopic']  // Debug level will be appended to topics
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

Log.info('Testing info level...');
Log.debug('Testing debug level...');
Log.fatal('Testing fatal level...');
