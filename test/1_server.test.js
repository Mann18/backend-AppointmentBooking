process.env.NODE_ENV = 'test'

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let expect = chai.expect;

chai.use(chaiHttp);

