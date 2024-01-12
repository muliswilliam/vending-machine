## Pre-requisites
- Node.js v21.4.0
- npm 10.2.4

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

This will start the server on port 3000. Go to http://localhost:3000/api to see the Swagger UI.

## Authorization

There are 2 roles in the system: user and maintenance.
The user role is the default role. The maintenance role is used to run protected operations of a vending machine such as refilling the machine with products or cash.

You can specify the role of the user in the header of the request. The header name is `x-role`. The value can be `user` or `maintenance`.

## Test

```bash
# unit tests
$ npm run test
```
