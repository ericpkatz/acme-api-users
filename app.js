const { User, Company } = require('./db');
const app = require('express')();
const cors = require('cors');
const path = require('path');
app.use(cors());
const Op = require('sequelize').Op;

module.exports = app;


const PAGE_SIZE = process.env.PAGE_SIZE || 50;

app.get('/', (req, res, next)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/companies', async(req, res, next)=> {
  res.send(await Company.findAll());
});

app.get('/api/companies/:id/users', async(req, res, next)=> {
  res.send(await User.findAll({where: {companyId: req.params.id }}));
});

app.get('/api/users/search/:term/:page?', (req, res, next)=> {
  const term = req.params.term;
  const where = {
    [Op.or]: [
      {
        firstName: {
          [Op.iLike]: `%${term}%`
        }
      },
      {
        lastName: {
          [Op.iLike]: `%${term}%`
        }
      },
      {
        middleName: {
          [Op.iLike]: `%${term}%`
        }
      },
      {
        email: {
          [Op.like]: `%${term}%`
        }
      },
      {
        title: {
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

