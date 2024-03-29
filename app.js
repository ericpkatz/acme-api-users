const { Note, User, Company, Product, CompanyProduct, FollowingCompany, CompanyProfits, Vacation, Bookmark } = require('./db');
const express = require('express');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
const cors = require('cors');
const path = require('path');
app.use(cors());
const Op = require('sequelize').Op;

app.use(require('morgan')('dev'));

/*
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
*/


module.exports = app;



const PAGE_SIZE = process.env.PAGE_SIZE || 50;

app.get('/', async(req, res, next)=> {
  const users = await User.findAll();
  const idx = Math.floor(Math.random()*users.length);
  res.render(path.join(__dirname, 'index.html'), { user: users[idx], company: await Company.findOne(), ENV: process.env.ENV || ''})
});

app.get('/api/companies/:id/companyProfits', async(req, res, next)=> {
  const profits = await CompanyProfits.findAll({
    where: { companyId: req.params.id } 
  });
  res.send(profits);
});

app.get('/api/users/random', async(req, res, next)=> {
  const users = await User.findAll();
  const idx = Math.floor(Math.random()*users.length);
  res.send(users[idx]);
});

app.get('/api/companies/random', async(req, res, next)=> {
  const companies = await Company.findAll();
  const idx = Math.floor(Math.random()*companies.length);
  res.send(companies[idx]);
});

app.get('/api/users/:id/vacations', async(req, res, next)=> {
  try {
    res.send(await Vacation.findAll({ where: { userId: req.params.id }}));
  }
  catch(ex){
    next(ex);
  };
});

app.get('/api/users/:id/notes', async(req, res, next)=> {
  try {
    res.send(await Note.findAll({ where: { userId: req.params.id}}));
  }
  catch(ex){
    next(ex);
  };
});

app.get('/api/users/:id/bookmarks', async(req, res, next)=> {
  try {
    res.send(await Bookmark.findAll({ where: { userId: req.params.id}}));
  }
  catch(ex){
    next(ex);
  };
});

//TODO - routes for notes
//
app.get('/api/users/:id/followingCompanies', async(req, res, next)=> {
  try {
    res.send(await FollowingCompany.findAll({ where: { userId: req.params.id}}));
  }
  catch(ex){
    next(ex);
  };
});

app.get('/api/companies', async(req, res, next)=> {
  res.send(await Company.findAll());
});

app.get('/api/products', async(req, res, next)=> {
  res.send(await Product.findAll());
});

app.get('/api/offerings', async(req, res, next)=> {
  res.send(await CompanyProduct.findAll());
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

app.get('/api/users/detail/:id', async (req, res, next)=> {
  try {
  const user =  await User.scope('detail').findByPk(req.params.id);
  if(!user){
    const error = new Error('user does not exist');
    error.status = 404;
    throw error;
  }
    return res.send(user);
  }
  catch(ex){
    next(ex);
  }

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


app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ message: err.message});
});
