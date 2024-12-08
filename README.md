
## Grade (Project 3)
![grade.jpg](https://github.com/itsabiral/jwks-server/blob/main/grade.JPG?raw=true)

## Test (Project 3)
![Test Case](https://github.com/itsabiral/jwks-server/blob/main/tests.JPG?raw=true)

# JWKS and JWT Project

## Overview

This application provides endpoints to manage JSON Web Keys (JWKS) and issue JSON Web Tokens (JWTs) for authentication. It is built with nodejs and express, it utilizes the `jsonwebtoken` and `node-jose` libraries for handling JWTs and key management.
Update: It manages public/private key pairs securely, and logs authentication attempts. It includes a rate limiter for enhanced security and performance.

I am now using sqlite to store the tokens.

## Features

- Generate and manage JWKS
- Issue valid JWTs
- Return expired JWTs based on request parameters
- Handle HTTP methods with appropriate responses
- Secure interaction with SQLite to store keys.
- Mocha and Chai for unit testing and API validation.
- Handle HTTP methods with appropriate status codes.
- RSA private keys are encrypted and stored in a database.
- Allows users to register with a unique username and email.
- Logs successful authentication requests with user ID and IP address.
- Limits the POST /auth endpoint to 10 requests per second per IP to prevent abuse.

## Technologies Used

- **Node.js**
- **Express**
- **jsonwebtoken**
- **node-jose**
- **Sqlite**
- **Mocha** and **Chai** (for testing)

## Running

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
2. **Run the Server**:
   ```bash
   node server.js

## Endpoints

### 1. JWKS Endpoint

- **URL**: `/.well-known/jwks.json`
- **Method**: `GET`
- **Description**: Returns the public keys used to verify JWTs.

### 2. Authentication Endpoint

- **URL**: `/auth`
- **Method**: `POST`
- **Description**: Returns a JWT for authentication. Accepts an optional query parameter expired=true to return an expired token.

### 2. Registration Endpoint

- **URL**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user with a randomly generated password.



