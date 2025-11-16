const stravaConfig = {
  clientId: process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  redirectUri: process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/auth/strava/callback',
  baseUrl: 'https://www.strava.com/api/v3'
};

module.exports = stravaConfig;