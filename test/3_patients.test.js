process.env.NODE_ENV = 'test'
const citizen = require('../models/citizen.model');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

describe('citizens', () => {
    before((done) => {  //Before each test we empty the database
        citizen.deleteMany({}, (err) => {
            if (err) done(err);
            done();
        });
    });

    //Test GET for citizens
    describe('/GET citizen', () => {
        it('GET all the citizens', (done) => {
            chai.request(server)
                .get('/citizens')
                .end((err, res) => {
                    if (err) {
                        done(err)
                    }
                    expect(res).to.have.status(200)
                    expect(res.body).to.eql([])
                    done()
                });
        });
    });

    //Test for /POST citizen/add
    describe('/POST citizen', () => {
        it('POST a citizen at citizens/add', (done) => {
            const newcitizen = new citizen({
                googleId: "testGoogleId"
            });

            chai.request(server)
                .post('/citizens/add')
                .send(newcitizen)
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
        it('PUT request to update the data', (done) => {
            chai.request(server)
            .put('/citizens/update-phone')
            .send({
                googleId: "testGoogleId",
                phoneNumber: "test37438243280432432432",
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

    //Test for /POST citizen/add
    describe('/POST citizen', () => {
        it('POST a citizen at citizens/add with a duplicate key', (done) => {
            const newcitizen = new citizen({
                googleId: "testGoogleId"
            });

            chai.request(server)
                .post('/citizens/add')
                .send(newcitizen)
                .end((err, res) => {
                    if (err) {
                        // console.log(err);
                        done(err);
                    }
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });

    //Test GET for citizens
    describe('/GET citizen', () => {
        it('GET all the citizens', (done) => {
            chai.request(server)
                .get('/citizens')
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
    
    after(function() {
        process.exit();
    })
});