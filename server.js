const faker = require('faker');
const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL);
const app = require('express')();
const cors = require('cors');
app.use(cors());

app.listen(process.env.PORT || 3000);

const PAGE_SIZE = 50;
app.get('/api/users/:page?', (req, res, next)=> {
  Promise.all([
    User.count(),
    User.findAll({
      order: [
        ['firstName'],
        ['lastName']
      ],
      limit: 50,
      offset: (req.params.page || 0) * 50
    })
  ])
  .then( ([count, users]) => res.send({ count, users}))
  .catch(next);
});

const User = conn.define('user', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  middleName: Sequelize.STRING,
  email: Sequelize.STRING
});

const domains = [
  'google',
  'yahoo',
  'friendster',
  'aol',
  'me',
  'mac',
  'microsoft'
];

User.generate = (limit)=> {
  const users = [];
  while(users.length < limit){
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const middleName = faker.name.firstName();
    users.push({
      firstName: firstName, 
      lastName: lastName,
      middleName: middleName,
      email: `${firstName}.${middleName}.${lastName}@${faker.random.arrayElement(domains)}.com`
    });
  }
  return users;
};

const sync = ()=> {
  const seed = User.generate(8000 + faker.random.number(300));
  return conn.sync({force: true })
    .then( ()=> Promise.all(seed.map( user => User.create(user))));
};

if(process.env.SYNC){
  sync();
}
