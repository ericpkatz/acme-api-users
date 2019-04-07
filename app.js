const { User } = require('./db');
const app = require('express')();
const cors = require('cors');
app.use(cors());
const Op = require('sequelize').Op;

module.exports = app;


const PAGE_SIZE = process.env.PAGE_SIZE || 50;

app.get('/api/users/search/:term/:page?', (req, res, next)=> {
  const term = req.params.term
  const where = {
    [Op.or]: [
      {
        firstName: {
          [Op.like]: `%${term}%`
        }
      },
      {
        lastName: {
          [Op.like]: `%${term}%`
        }
      },
      {
        middleName: {
          [Op.like]: `%${term}%`
        }
      },
      {
        email: {
          [Op.like]: `%${term}%`
        }
      }
    ]
  };
  Promise.all([
    User.count({ where }),
    User.findAll({
      where,
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

