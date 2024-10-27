import { use, expect } from 'chai'
import chaiHttp from 'chai-http'
const chai = use(chaiHttp)
import jwt from 'jsonwebtoken'; 

chai.request.execute()

import { app } from './../server.js';


describe('JWKS Server Tests', () => {
  let validToken;
  let expiredToken;

  // Test case 1: Ensure the server is running and responds with 200 on /.well-known/jwks.json
  it('should return 200 for GET /.well-known/jwks.json', (done) => {
    chai
      .request.execute(app)
      .get('/.well-known/jwks.json')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('keys');
        done();
      });
  });

  // Test case 2: Generate a valid JWT and ensure it is returned
  it('should generate a valid JWT on POST /auth', (done) => {
    chai
      .request.execute(app)
      .post('/auth')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.a('string');
        validToken = res.text; 
        done();
      });
  });

  // Test case 3: Generate an expired JWT using the expired query parameter
  it('should generate an expired JWT on POST /auth with ?expired=true', (done) => {
    chai
      .request.execute(app)
      .post('/auth?expired=true')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.be.a('string');
        expiredToken = res.text; 
        done();
      });
  });

  // Test case 4: Ensure expired JWT is indeed expired
  it('should not validate the expired JWT', (done) => {
    chai
      .request.execute(app)
      .post('/auth')
      .query({ expired: 'true' })
      .end((err, res) => {
        const decoded = jwt.decode(res.text, { complete: true });
        expect(decoded.payload.exp).to.be.lessThan(Math.floor(Date.now() / 1000));
        done();
      });
  });

  // Test case 5: Ensure the valid JWT is not expired
  it('should validate the generated valid JWT', (done) => {
    const decoded = jwt.decode(validToken, { complete: true });
    expect(decoded.payload.exp).to.be.greaterThan(Math.floor(Date.now() / 1000));
    done();
  });

  // Test case 6: Return 405 for invalid HTTP methods on /.well-known/jwks.json
  it('should return 404 for invalid method on /.well-known/jwks.json', (done) => {
    chai
      .request.execute(app)
      .post('/.well-known/jwks.json') 
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});
