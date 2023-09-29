const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(db.url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
dbConnection.once('open', () => console.log('Connected to MongoDB'));

// Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport
require('./config/passport')(passport);

// Express Session



// Routes
app.use('/auth', require('./routes/auth'));

// API



// app.use('/api', require('./routes/api'));
// app.use('/api', require('./routes/api'));
// app.use('/api', require('./routes/api'));
// app.use('/api', require('./routes/api'));


app.use('/api', require('./routes/api'));
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

