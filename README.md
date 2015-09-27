bunyan-amqp
====================

AMQP 0.9.1 compatible transport stream for use with the Bunyan logging library.  Intended to be used with a RabbitMQ "topic" type exchange.  Where the hostname becomes the first topic, the name of the Bunyan logger application is used as the secondary topic followed by the string log level.  Example Topic: "My-MacbookPro.MyAppName.info".  Has only been tested with RabbitMQ but it should be AMQP standards compliant.

TODO:
  - Test suite
  - More configuration options

This package was created for use with microservices at my company.  I would eventually like to make this more configurable for public consumption.

```
var Log = require('bunyan').createLogger({
  name: 'MyAppName'
  streams: [
    {
      stream: process.stdout,
      level: 'trace',
    },
    {
      type: 'raw',
      level: 'debug',
      stream: require('bunyan-amqp')({
        host: '127.0.0.1',
        port: 5672,
        vhost: 'logger',
        exchange: 'exchangeName',
        queue: 'queueName',
        username: 'username',
        password: 'password',
      }),
    },
  ],
});

var ChildLog = Log.child({ module: 'MyAppNameChildModule' });

Log.info('Testing info level...');
Log.debug('Testing debug level...');
Log.fatal('Testing fatal level...');

ChildLog.info('Testing child info level...');
ChildLog.debug('Testing child debug level...');
ChildLog.fatal('Testing child fatal level...');
```
