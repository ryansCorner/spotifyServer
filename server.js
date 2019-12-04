let express = require('express')
let request = require('request')
let querystring = require('querystring')
const dotenv = require("dotenv");

// let db = require('db')
dotenv.config();

let app = express()
let client_id = process.env.DB_SPOTIFY_CLIENT_ID
let client_secret = process.env.DB_SPOTIFY_CLIENT_SECRET; // Your secret

let redirect_uri = process.env.DB_REDIRECT_URI || 'http://localhost:8888/callback'


app.get('/loginSpotify', function (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: 'user-read-private user-read-email playlist-read-collaborative playlist-modify-private playlist-modify-public playlist-read-private user-modify-playback-state user-read-currently-playing user-read-playback-state user-library-modify user-library-read user-follow-modify user-follow-read user-read-recently-played user-top-read streaming app-remote-control',
      redirect_uri
    }))
})

app.get('/callback', function (req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        client_id + ':' + client_secret
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token
    let uri = process.env.DB_FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)