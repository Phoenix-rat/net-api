const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require('ms');
const app = express();
const port = 3000;
let password = process.env.MONGO_PASSWORD;
let URL = process.env.MONGO_URL;
let username = process.env.MONGO_USERNAME;
const uri = `mongodb+srv://${username}:${password}@${URL}/?retryWrites=true&w=majority`;

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/callback';

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


const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

try {
app.get('/login', (req, res) => {
  const state = generateString(16);
  const scopes = 'user-read-private user-read-email user-read-currently-playing streaming user-top-read user-read-recently-played'; // İzinlerinizi burada belirtin
  res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scopes,
    redirect_uri: redirect_uri,
    state: state
  })}`);
});


const processTopTracks = (userTopTracks) => {
  return userTopTracks.map((track) => {
    const artist = track.album.artists[0].name;
    const album = track.name;
    return `${album} - ${artist}`;
  });
};

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: {
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }
  }
    const response = await axios(authOptions);
    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;
    const userTopTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { 'Authorization': 'Bearer ' + access_token },
      params: { limit: 10 } // İstediğiniz sayıda en iyi parçayı alın
    });
    const usernameget = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + access_token },
    });
    const emails = usernameget.data.email;
    const userTopTracks = userTopTracksResponse.data.items;
    const topTracksText = processTopTracks(userTopTracks).join(' \n ');
    db.set(emails, topTracksText);
    res.json(topTracksText); // En iyi parçalarınızı JSON olarak döndürün
  }); } catch (error) {
  console.error(error);
  res.status(500).send('Bir hata oluştu');
}