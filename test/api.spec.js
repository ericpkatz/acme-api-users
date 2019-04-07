process.env.PAGE_SIZE = 2;
const app = require('supertest')(require('../app'));
const { expect } = require('chai');
const { sync } = require('../db');

describe('API', ()=> {
  beforeEach(()=> sync.TEST());
  describe('/api/users with no page given', ()=> {
    it('returns the first page of users and count', ()=> {
      return app.get('/api/users')
        .expect(200)
        .then( response => {
          expect(response.body.count).to.equal(5);
          expect(response.body.users.length).to.equal(2);
          expect(response.body.users[0].firstName).to.equal('curly');
        });
    });
  });
  describe('/api/users with a page given', ()=> {
    it('returns the first page of users and count', ()=> {
      return app.get('/api/users/2')
        .expect(200)
        .then( response => {
          expect(response.body.users.length).to.equal(1);
          expect(response.body.users[0].firstName).to.equal('shep');
        });
    });
  });
  describe('/api/users/search/:term with no page', ()=> {
    it('returns the first page of users who match term', ()=> {
      return app.get('/api/users/search/brown')
        .expect(200)
        .then( response => {
          expect(response.body.count).to.equal(3);
          expect(response.body.users.length).to.equal(2);
          expect(response.body.users[0].firstName).to.equal('curly');
        });
    });
  });
  describe('/api/users/search/:term/:page with page', ()=> {
    it('returns the correct page of users who match term', ()=> {
      return app.get('/api/users/search/brown/1')
        .expect(200)
        .then( response => {
          expect(response.body.count).to.equal(3);
          expect(response.body.users.length).to.equal(1);
          expect(response.body.users[0].firstName).to.equal('shep');
        });
    });
  });
});
