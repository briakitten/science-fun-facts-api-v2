const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');
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
  const query = `UPDATE facts SET fact_subject = $1, fact_line = $2,
    fact_description = $3, video_ref = $4, learn_ref = $5
    WHERE id = $6;`;
  const values = [subject, line, description, video_ref, learn_ref, row_data.id];

  const client = new Client({
    connectionString: db_url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    let result = await client.query(query, values);
    return result;
  } finally {
    client.end();
  }
}

// Adds new data to the database
async function database_insert(row_data) {
  const subject = row_data.fact_subject, line = row_data.fact_line, description = row_data.fact_description,
    video_ref = row_data.video_ref, learn_ref = row_data.learn_ref;
  const query = `INSERT INTO facts (fact_subject, fact_line, fact_description, video_ref, learn_ref)
    VALUES ($1, $2, $3, $4, $5)`;
  const values = [subject, line, description, video_ref, learn_ref];

  const client = new Client({
    connectionString: db_url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    let result = await client.query(query, values);
    return result;
  } finally {
    client.end();
  }
}

// GET request/response for all data
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

// PUT request/response for fact id
app.put('/api/facts/:id', body_parser.json(), (req, res) => {
  const body = req.body;
  if (body == undefined) res.send(500, {error: "No body found in the request!"});

  database_update(req.body);

  res.send('fact ' + req.params.id + " with data: " + req.body);
});

// POST request/response for adding fact
app.post('/api/facts', body_parser.json(), (req, res) => {
  const body = req.body;
  if (body == undefined) res.send(500, {error: "No body found in the request!"});

  database_insert(req.body);

  res.send('new fact');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));