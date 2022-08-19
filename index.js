const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const path = require('path');
const PORT = process.env.PORT || 5000;

// url from heroku PostgreSQL database
const db_url = process.env.DATABASE_URL;

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .use(cors({origin: '*'}))

// sends database via REST service
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
      client.end();
  }
}

// Update row information in database
async function database_update(row_data) {
  const subject = row_data.fact_subject, line = row_data.fact_line, description = row_data.fact_description,
    video_ref = row_data.video_ref, learn_ref = row_data.learn_ref;
  const query = `INSERT INTO facts (fact_subject, fact_line, fact_description, video_ref, learn_ref)
	  VALUES ('${subject}', '${line}', '${description}', '${video_ref}', '${learn_ref}');`;

  const client = new Client({
    connectionString: db_url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    let result = await client.query(query);
    return result;
  } finally {
    client.end();
  }
}

// Adds new data to the database
async function database_insert(row_data) {

}

// GET request/response
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
});

// PUT request/response
app.put('/api/facts/:id', (req, res) => {
  res.send('fact ' + req.params.id + ' with body: ' + req.body.fact);
});

// POST request/response
app.post('/api/facts', (req, res) => {
  res.send('new fact');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));