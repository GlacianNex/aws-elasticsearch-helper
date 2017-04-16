# AWS-ElasticSearch-Helper

This library is used as a helper to easily create, delete and update ElastSearch. It is specifically designed to be used from inside AWS lambda.

## Motivation

Core driving factor here was that I write a lot of lambdas and a lot of them require some very core operations on ElasticSearch server. In most cases it I need simple operations like create, update or delete. 

Yet this process requires a bit of setup code to configure server, proxy (if running locally) and to wrap the request-response in a promise.

The goal of this library is to reduce the amount of setup code you need to perform basic ES operations to 2 - 3 lines and not have to copy/paste same code across projects.

## Usage

Library permits you to specify the following attributes:
* host - Address of your ElasticSearch server (required).
* log - level of logging you want done on your ES events, default: 'info'. (optional)
* profile - profile that will be used to get your AWS credentials. If none provided it will use `AWS.EnvironmentCredentials` with 'AWS' prefix (default in lambda environments) to get credentials (optional)
* awsRegion - region in which your ElasticSearch is located, default: `process.env.AWS_DEFAULT_REGION`. (optional)

``` js
exports.handler = (event, context, callback) => {
    const ESServer = require('aws-elasticsearch-helper');
    const esSrv = new ESServer('https://awsesome.sauce.com', 'info');

    esSrv.ping().
    then(() => esSrv.createDocument('index', 'routing', 'id', {hello: 'world'})).
    then(() => callback()).
    catch((err) => callback(err));
}
```

