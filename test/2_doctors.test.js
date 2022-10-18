process.env.NODE_ENV = 'test'
const officer = require('../models/officer.model');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

describe('officers', () => {
    before((done) => {  //Before each test we empty the database
        officer.deleteMany({}, (err) => {
            if (err) done(err);
            done();
        });
    });

    //Test GET for officers
    describe('/GET officer', () => {
        it('GET all the officers', (done) => {
            chai.request(server)
                .get('/officers')
                .end((err, res) => {
                    if (err) {
                        done(err)
                    }
                    expect(res).to.have.status(200);
                    expect(res.body).to.eql([]);
                    done();
                });
        });
    });

    //Test for /POST officer/add
    describe('/POST officer', () => {
        it('POST a officer at officers/add', (done) => {
            const newofficer = new officer({
                username: "testUsername",
                password: "testPassword"
            });

            chai.request(server)
                .post('/officers/add')
                .send(newofficer)
                .end((err, res) => {
                    if (err) {
                        done(err)
                    }
                    expect(res).to.have.status(200)
                    done();
                });
        });
    });

    describe('/PUT', () => {
        it('PUT request to update the officer data', (done) => {
            chai.request(server)
            .put('/officers/update')
            .send({
                username: "testUsername",
                phoneNumber: "test37438243280432432432",
                specialization: "testSpecialization",
                feesPerSession: "testfeesPerSessionTest"
            })
            .end((err, res) => {
                if (err) {
                    console.log(err)
                    done(err)
                }
                expect(res).to.have.status(200)
                done();
            });
        })
    })

    // Test to add a officer with duplicate key
    describe('/POST officer', () => {
        it('POST a officer at officers/add with a duplicate key', (done) => {
            const newofficer = new officer({
                username: "testUsername"
            });

            chai.request(server)
                .post('/officers/add')
                .send(newofficer)
                .end((err, res) => {
                    if (err) {
                        done(err)
                    }
                    expect(res).to.have.status(400)
                    done();
                });
        });
    });

    //Test GET for officers
    describe('/GET officer', () => {
        it('GET all the officers', (done) => {
            chai.request(server)
                .get('/officers')
                .end((err, res) => {
                    if (err) {
                        console.log(err)
                        done(err);
                    }
                    expect(res).to.have.status(200);
                    expect(res.body.length).eql(1);
                    done()
                });
        });
    });
    
});
    
