'use strict';

const elasticsearch = require('elasticsearch');
const httpAWSES = require('http-aws-es');
const AWS = require('aws-sdk');
const Q = require('q');

class ESServer {
  constructor(host, log, awsRegion, profile) {
    const params = {
      connectionClass: httpAWSES,
      host,
      amazonES: {},
      log: log || 'info'
    };

    params.amazonES.region = awsRegion || process.env.AWS_DEFAULT_REGION;
    AWS.config.update({
      region: params.amazonES.region
    });

    if (profile) {
      params.amazonES.credentials = new AWS.SharedIniFileCredentials({
        profile
      });
    }

    this.client = new elasticsearch.Client(params);
  }

  doesIndexExist(index) {
    const deferred = Q.defer();
    const params = {
      index
    };
    this.client.indices.exists(params).then(result => deferred.resolve(result), err => deferred.reject(err));
    return deferred.promise;
  }

  createIndex(index, body) {
    const deferred = Q.defer();
    const params = {
      index,
      body
    };
    this.client.indices.create(params).then(result => deferred.resolve(result), err => deferred.reject(err));
    return deferred.promise;
  }

  updateDocument(index, routing, type, id, document) {
    const deferred = Q.defer();
    const params = {
      index,
      type,
      id,
      routing,
      body: {
        doc: document
      }
    };
    this.client.update(params).then(result => deferred.resolve(result), err => deferred.reject(err));
    return deferred.promise;
  }

  deleteDocument(index, routing, type, id) {
    const deferred = Q.defer();
    const params = {
      index,
      type,
      id,
      routing
    };
    this.client.delete(params).then(result => deferred.resolve(result), err => deferred.reject(err));
    return deferred.promise;
  }

  createDocument(index, routing, type, id, document) {
    const deferred = Q.defer();
    const params = {
      body: document,
      index,
      type,
      routing,
      id
    };
    this.client.index(params).then(result => deferred.resolve(result), err => deferred.reject(err));
    return deferred.promise;
  }

  ping() {
    const deferred = Q.defer();
    this.client
      .ping({
        requestTimeout: 30000
      })
      .then(() => deferred.resolve(), err => deferred.reject(err));
    return deferred.promise;
  }
}

module.exports = ESServer;
