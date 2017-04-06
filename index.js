'use strict';

const elasticsearch = require('elasticsearch');
const config = require('config');
const AWS = require('aws-sdk');
const Q = require('q');

class ESServer {

    constructor(host, region, awsProfile) {
        let credentials = new AWS.EnvironmentCredentials('AWS');
        if (awsProfile) {
            credentials = new AWS.SharedIniFileCredentials({profile: awsProfile});
        }

        const region = region || process.env.AWS_DEFAULT_REGION;
        this.client = new elasticsearch.Client({
            connectionClass: require('http-aws-es'),
            host: host,
            amazonES: {
                credentials,
                region
            },
            log: 'info'
        });
    }

    doesIndexExist(index) {
        const deferred = Q.defer();
        const params = { index };
        this.client.indices.exists(params).
        then(result => deferred.resolve(result), err => deferred.reject(err));
        return deferred.promise;
    }

    updateDocument(index, routing, type, id, document) {
        const deferred = Q.defer();
        const params = { index, type, id, routing, body: { doc: document } };
        this.client.update(params).
        then(result => deferred.resolve(result), err => deferred.reject(err));
        return deferred.promise;
    }

    deleteDocument(index, routing, type, id) {
        const deferred = Q.defer();
        const params = { index, type, id, routing };
        this.client.delete(params).
        then(result => deferred.resolve(result), err => deferred.reject(err));
        return deferred.promise;
    }

    createDocument(index, routing, type, id, document) {
        const deferred = Q.defer();
        const params = { body: document, index, type, routing, id };
        this.client.index(params).
        then(result => deferred.resolve(result), err => deferred.reject(err));
        return deferred.promise;
    }

    ping() {
        const deferred = Q.defer();
        this.client.ping({ requestTimeout: 30000, hello: 'elasticsearch' }).
        then(() => deferred.resolve(), err => deferred.reject(err));
        return deferred.promise;
    }
}

module.exports = ESServer;