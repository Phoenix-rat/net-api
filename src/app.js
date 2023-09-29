const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const ms = require('ms');
const app = express();
const port = 3000;
let password = process.env.MONGO_PASSWORD;
let URL = process.env.MONGO_URL;
let username = process.env.MONGO_USERNAME;
const uri = `mongodb+srv://${username}:${password}@${URL}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("NETAPI").command({ ping: 1 });
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

app.set('views', path.join(__dirname, '../views'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', () => {
  client.close().then(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
