const app = require('./app');
const { sync  } = require('./db');
const axios = require('axios');

app.listen(process.env.PORT || 3000);

const SYNC = process.env.SYNC;
if(SYNC){
  sync[SYNC]()
    .then(()=> console.log(`sync ${SYNC} done`));
}

const ping = ()=> {
  return axios.get("https://acme-users-api.herokuapp.com/api/users")
    .then(()=> console.log('good to go'));
};


const delay = ()=> {
  setTimeout(function() {
    ping()
      .then( ()=> delay());
  }, process.env.DELAY*1); // every 5 minutes (300000)
}

delay();
