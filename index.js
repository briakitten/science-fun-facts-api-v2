const express = require('express');
const { Client } = require('pg');
const path = require('path');
const PORT = process.env.PORT || 5000;
const db_url = process.env.DATABASE_URL;

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

async function database_get() {
  const client = new Client({
    connectionString: db_url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
      await client.connect();
      let result = await client.query('SELECT * FROM facts;');
      return result;
  } finally {
      client.end()
  }
}

app.get('/api/', (req, res) => {
  const jsonData = {
    data: []
  }
  database_get().then((value) => {
    value.rows.forEach((v, i) => {
      jsonData.data.push(v);
    })
    res.send(jsonData);
  });

  // console.log(db_url);
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));