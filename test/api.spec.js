process.env.PAGE_SIZE = 2;
const app = require('supertest')(require('../app'));
const { expect } = require('chai');
const { sync, FollowingCompany, Note, Vacation } = require('../db');
const moment = require('moment');

describe('API', ()=> {
  let seed;
  beforeEach(async()=> seed = await sync.TEST());
  describe('/api/users/:id/followingCompanies', ()=> {
    let following;
    beforeEach(async()=> {
      const user = seed.users[0];
      const companies = seed.companies.slice(0, 5);
      following = await Promise.all(companies.map( company => FollowingCompany.create({ userId: user.id, companyId: company.id})));
    });
    it('user can only follow 5 companies', ()=> {
      return app.post(`/api/users/${seed.users[0].id}/followingCompanies/`)
        .send({
          companyId: seed.companies[5].id
        })
        .expect(500)
        .then( response => {
          expect(response.body.message).to.equal('user is already following 5 companies');
        });
    });
    it('User can follow a company', async()=> {
      return app.delete(`/api/users/${seed.users[0].id}/followingCompanies/${following[0].id}`)
      .expect(204)
      .then(()=> {
        return app.post(`/api/users/${seed.users[0].id}/followingCompanies/`)
          .send({
            companyId: following[0].companyId
          })
      })
      .then( response => {
        expect(response.status).to.equal(201);
      });

    });
    it('user can unfollow a company', ()=> {
      return app.delete(`/api/users/${seed.users[0].id}/followingCompanies/${following[0].id}`)
      .expect(204);
    });
    it('user can update a following', ()=> {
      return app.put(`/api/users/${seed.users[0].id}/followingCompanies/${following[0].id}`)
      .send({ rating: 1 })
      .expect(200)
      .then( response => {
        expect(response.body.rating).to.equal(1);
      });
    });
  });
  describe('/api/users/:id/notes', ()=> {
    let vacations, user;
    beforeEach(async()=> {
      user = seed.users[0];
      const _vacations = [
        { startDate: '3/19/2019', endDate: moment()},
        { startDate: moment(), endDate: moment()},
        { startDate: moment(), endDate: moment()},
      ]; 
      vacations = await Promise.all(_vacations.map( vacation => Vacation.create({ ...vacation, userId: user.id })));
    });
    it('user can get vacations', ()=> {
      expect((new moment(vacations[0].startDate).format('MM/DD/YYYY'))).to.equal('03/19/2019');
      return app.get(`/api/users/${ user.id }/vacations`)
        .expect(200)
        .then( response => {
          expect(response.body.length).to.equal(3);
        });
    });
    it('user can only have 3 vacations', ()=> {
      return app.post(`/api/users/${ user.id }/vacations`)
        .send({ startDate: moment(), endDate: moment()})
        .expect(500)
        .then( response => {
          expect(response.body.message).to.equal('user already has 3 vacations');
        });
    });
    it('user can create a vacation', async()=> {
      await vacations[0].destroy();   
      return app.post(`/api/users/${ user.id }/vacations`)
        .send({ startDate: moment(), endDate: moment() })
        .expect(201)
        .then( response => {
          expect(response.body.startDate).to.be.ok;
          expect(response.body.endDate).to.be.ok;
        });
    });
    it('end date can not be less than start date', async()=> {
      await vacations[0].destroy();   
      return app.post(`/api/users/${ user.id }/vacations`)
        .send({ startDate: moment().add(1, 'days'), endDate: moment() })
        .expect(500)
        .then( response => {
          expect(response.body.message).to.equal('end date is less than start date');
        });
    });
    it('user can update a vacation', ()=> {
      return app.put(`/api/users/${ user.id }/vacations/${vacations[0].id}`)
        .send({ startDate: moment(), endDate: moment()})
        .expect(200)
        .then( response => {
          expect(response.body.startDate).to.be.ok;
          expect(response.body.endDate).to.be.ok;
        });
    });
    it('user can delete a vacation', ()=> {
      return app.delete(`/api/users/${ user.id }/vacations/${vacations[0].id}`)
        .expect(204)
    });
  });
  describe('/api/users/:id/notes', ()=> {
    let notes, user;
    beforeEach(async()=> {
      user = seed.users[0];
      const texts = ['foo', 'bar', 'bazz', 'quq','bug']; 
      notes = await Promise.all(texts.map( text => Note.create({ userId: user.id, text })));
    });
    it('user can only have 5 notes', ()=> {
      return app.post(`/api/users/${ user.id }/notes`)
        .send({ text: 'hi' })
        .expect(500)
        .then( response => {
          expect(response.body.message).to.equal('user can only have a max of 5 notes');
        });
    });
    it('user can create a note', async()=> {
      await notes[0].destroy();   
      return app.post(`/api/users/${ user.id }/notes`)
        .send({ text: 'hi' })
        .expect(201)
        .then( response => {
          expect(response.body.text).to.equal('hi');
        });
    });
    it('user can update a note', ()=> {
      return app.put(`/api/users/${ user.id }/notes/${notes[0].id}`)
        .send({ text: 'buh bye', archived: true })
        .expect(200)
        .then( response => {
          expect(response.body.text).to.equal('buh bye');
          expect(response.body.archived).to.equal(true);
        });
    });
    it('user can delete a note', ()=> {
      return app.delete(`/api/users/${ user.id }/notes/${notes[0].id}`)
        .expect(204)
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
