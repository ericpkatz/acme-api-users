const app = require('./app');
const { sync  } = require('./db');
const axios = require('axios');

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`listening on port ${port}`));

const SYNC = process.env.SYNC;
if(SYNC){
  sync[SYNC]()
    .then(()=> console.log(`sync ${SYNC} done`));
}

