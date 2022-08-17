const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const db_url = process.env.DATABASE_URL;

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

app.get('/api/', (req, res) => {
  console.log(db_url);
  return res.send("Recieved a GET HTTP method with database" + db_url);
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));