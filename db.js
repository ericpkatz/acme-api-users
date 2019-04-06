const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL);
const faker = require('faker');

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

const _sync = ()=> conn.sync({ force: true });

const sync  = {
  BIG: function(){
    console.log('sync big starting');
    const seed = User.generate(8000 + faker.random.number(300));
    return _sync({force: true })
      .then( ()=> Promise.all(seed.map( user => User.create(user))));
  },
  TEST: function(){
    const users = [
      {
        firstName: 'moe',
        lastName: 'green'
      },
      {
        firstName: 'larry',
        lastName: 'brown'
      },
      {
        firstName: 'curly',
        lastName: 'freid'
      },
      {
        firstName: 'shep',
        lastName: 'smith'
      },
      {
        firstName: 'prof',
        lastName: 'katz'
      }
    ];
    console.log('syncing for test');
    return _sync()
      .then( ()=> users.map(({ firstName, lastName}) => {
        return {
          firstName,
          lastName,
          middleName: firstName.slice(0, 1),
          email: `${firstName}.${lastName}@example.com`
        };
      })) 
      .then( users => Promise.all(users.map( user => User.create(user))))
  }
};

module.exports = {
  sync,
  User
};
