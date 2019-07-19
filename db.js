const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL);
const faker = require('faker');

const User = conn.define('user', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  middleName: Sequelize.STRING,
  email: Sequelize.STRING,
  title: Sequelize.STRING
});

const Company = conn.define('company', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING,
  phone: Sequelize.STRING,
});

User.belongsTo(Company);

const domains = [
  'google',
  'yahoo',
  'friendster',
  'aol',
  'me',
  'mac',
  'microsoft'
];

Company.generate = (limit)=> {
  const items = [];
  while(items.length < limit){
    const name = faker.company.companyName();
    const phone = faker.phone.phoneNumber();
    items.push({
      name,
      phone
    });
  }
  return items;
};

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
      email: `${firstName}.${middleName}.${lastName}@${faker.random.arrayElement(domains)}.com`,
      title: faker.name.jobTitle()
    });
  }
  return users;
};

const _sync = ()=> conn.sync({ force: true });

const sync  = {
  DEV: function(){
    console.log('sync dev starting');
    const seedUsers = User.generate(200 + faker.random.number(30));
    const seedCompanies = Company.generate(30 + faker.random.number(10));
    return _sync({force: true })
      .then( async()=> {
        const companies = await Promise.all(seedCompanies.map( company => Company.create(company)))
        seedUsers.forEach( user => user.companyId = faker.random.arrayElement(companies).id);
        const users = await Promise.all(seedUsers.map( user => User.create(user)))
      });
  },
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
        lastName: 'brown'
      },
      {
        firstName: 'shep',
        lastName: 'smith',
        middleName: 'brownee'
      },
      {
        firstName: 'prof',
        lastName: 'katz'
      }
    ];
    console.log('syncing for test');
    return _sync()
      .then( ()=> users.map(({ firstName, lastName, middleName}) => {
        return {
          firstName,
          lastName,
          middleName: middleName || firstName.slice(0, 1),
          email: `${firstName}.${lastName}@example.com`,
          title: faker.name.jobTitle()
        };
      })) 
      .then( users => Promise.all(users.map( user => User.create(user))))
  }
};

module.exports = {
  sync,
  User,
  Company
};
