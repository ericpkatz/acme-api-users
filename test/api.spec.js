process.env.PAGE_SIZE = 2;
const app = require('supertest')(require('../app'));
const { expect } = require('chai');
const { sync } = require('../db');

describe('API', ()=> {
  let seed;
  beforeEach(async()=> seed = await sync.TEST());
  describe('/api/users/:id/favoriteCompanies', ()=> {
    it('returns the users favorite companies', ()=> {
      return app.get(`/api/users/${seed.users[0].id}/followingCompanies`)
        .expect(200)
        .then( response => {
          expect(response.body).to.eql([]);
        });
    });
  });
  describe('POST /api/users/:id/favoriteCompanies', ()=> {
    it('returns the users favorite companies', ()=> {
      return app.post(`/api/users/${seed.users[0].id}/followingCompanies`)
        .send({ companyId: seed.companies[1].id})
        .expect(200)
        .then( response => {
          expect(response.body.userId).to.equal(seed.users[0].id);
          expect(response.body.companyId).to.equal(seed.companies[1].id);
          return app.post(`/api/users/${seed.users[0].id}/followingCompanies`)
            .send({ companyId: seed.companies[1].id})
        })
        .then( response => {
          expect(response.status).to.equal(500);
          expect(response.body.message).to.equal('already being followed');
        });
    });
  });
  describe('DELETE /api/users/:id/favoriteCompanies', ()=> {
    it('returns the users favorite companies', ()=> {
      return app.post(`/api/users/${seed.users[0].id}/followingCompanies`)
        .send({ companyId: seed.companies[1].id})
        .expect(200)
        .then( response => {
          expect(response.body.userId).to.equal(seed.users[0].id);
          expect(response.body.companyId).to.equal(seed.companies[1].id);
          return app.delete(`/api/users/${seed.users[0].id}/followingCompanies/${response.body.id}`)
        })
        .then( response => {
          expect(response.status).to.equal(201);
          return app.get(`/api/users/${seed.users[0].id}/followingCompanies`)
        })
        .then( response => {
          expect(response.body).to.eql([]);
        });
    });
  });
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
  describe('/api/users/search/:term/:page with page', ()=> {
    it('returns the correct page of users who match term', ()=> {
      return app.get('/api/users/search/Brown/1')
        .expect(200)
        .then( response => {
          expect(response.body.count).to.equal(3);
          expect(response.body.users.length).to.equal(1);
          expect(response.body.users[0].firstName).to.equal('shep');
        });
    });
  });
});
