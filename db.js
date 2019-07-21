const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL, { logging: false });
const faker = require('faker');

const Product = conn.define('product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING,
  suggestedPrice: Sequelize.DECIMAL
});

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
  title: Sequelize.STRING,
  bio : Sequelize.TEXT
}, {
  defaultScope: {
    attributes: { exclude: ['bio'] }
  },
  scopes: {
    detail: {

    }
  },
  hooks: {
    beforeSave: (user)=> {
      user.bio = `${user.firstName } ${ faker.lorem.paragraph(1)} ${ user.lastName } ${ faker.lorem.paragraph(1)} ${user.email} ${ faker.lorem.paragraph(1)}`;
    }
  }
});

const CompanyProduct = conn.define('company_product', {
  price: Sequelize.DECIMAL

});

const Company = conn.define('company', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING,
  phone: Sequelize.STRING,
  state: Sequelize.STRING,
  catchPhrase: Sequelize.STRING
});

CompanyProduct.belongsTo(Product);
CompanyProduct.belongsTo(Company);

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
    const state = faker.address.state();
    const catchPhrase = faker.company.catchPhrase();
    items.push({
      name,
      phone,
      state,
      catchPhrase
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

const seedProducts = async (companies)=> {
  const names = ['foo', 'bar', 'bazz', 'quq', 'fizz', 'buzz' ];
  const products = await Promise.all(names.map( name => Product.create({ name, suggestedPrice: faker.random.number(20)  + 3 })));
  const promises = await Promise.all(companies.map( company => {
    const count = Math.floor(Math.random()*4); 
    const _products = [];
    while(_products.length < count){
      const random = faker.random.arrayElement(products); 
      if(!_products.includes(random)){
        _products.push(random);
      }
    }
    return Promise.all(_products.map( p => CompanyProduct.create({ productId: p.id, companyId: company.id, price: p.suggestedPrice - (p.suggestedPrice * (faker.random.number(5)/100))})));
  }));

};

const sync  = {
  DEV: function(){
    console.log('sync dev starting');
    const seedUsers = User.generate(200 + faker.random.number(30));
    const seedCompanies = Company.generate(8 + faker.random.number(3));
    return _sync({force: true })
      .then( async()=> {
        const companies = await Promise.all(seedCompanies.map( company => Company.create(company)))
        const products = await seedProducts(companies);
        seedUsers.forEach( user => user.companyId = faker.random.arrayElement(companies).id);
        const users = await Promise.all(seedUsers.map( user => User.create(user)))
      });
  },
  BIG: function(){
    console.log('sync big starting');
    const seedUsers = User.generate(1000 + faker.random.number(300));
    const seedCompanies = Company.generate(30 + faker.random.number(10));
    return _sync({force: true })
      .then( async()=> {
        const companies = await Promise.all(seedCompanies.map( company => Company.create(company)))
        const products = await seedProducts(companies);
        seedUsers.forEach( user => user.companyId = faker.random.arrayElement(companies).id);
        const users = await Promise.all(seedUsers.map( user => User.create(user)))
      });
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
  Company,
  Product,
  CompanyProduct
};
