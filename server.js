const app = require('./app');
const { sync  } = require('./db');
const axios = require('axios');

app.listen(process.env.PORT || 3000);

const SYNC = process.env.SYNC;
if(SYNC){
  sync[SYNC]()
    .then(()=> console.log(`sync ${SYNC} done`));
}

