const { User } = require('./db');
const app = require('express')();
const cors = require('cors');
app.use(cors());

module.exports = app;


const PAGE_SIZE = process.env.PAGE_SIZE || 50;
app.get('/api/users/:page?', (req, res, next)=> {
  Promise.all([
    User.count(),
    User.findAll({
      order: [
        ['firstName'],
        ['lastName']
      ],
      limit: PAGE_SIZE,
      offset: (req.params.page || 0) * PAGE_SIZE 
    })
  ])
  .then( ([count, users]) => res.send({ count, users}))
  .catch(next);
});

