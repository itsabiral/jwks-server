import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('JWKS and Auth Tests', function () {
  // Test the /jwks.json endpoint
  it('should return a valid JWKS response', function (done) {
    request(app)
      .get('/.well-known/jwks.json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property('keys');
        expect(res.body.keys).to.be.an('array');
        done();
      });
  });

  // Test the /auth endpoint with valid token
  it('should return a valid JWT token', function (done) {
    request(app)
      .post('/auth')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.text).to.be.a('string');
        done();
      });
  });

  // Test the /auth endpoint with expired token
  it('should return an expired JWT token when "expired=true" is passed', function (done) {
    request(app)
      .post('/auth?expired=true')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.text).to.be.a('string');
        done();
      });
  });

  // Test the /jwks.json endpoint with invalid method (POST)
  it('should return 405 for non-GET request to /jwks.json', function (done) {
    request(app)
      .post('/.well-known/jwks.json')
      .expect(405)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });

  // Test the /auth endpoint with invalid method (GET)
  it('should return 405 for non-POST request to /auth', function (done) {
    request(app)
      .get('/auth')
      .expect(405)
      .end(function (err) {
        if (err) return done(err);
        done();
      });
  });
});
