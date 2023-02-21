const SpotifyWebApi = require("spotify-web-api-node");

const getNewSpotifyWebApi = () => {
  let cachedApi;

  if(!cachedApi){
    cachedApi = new SpotifyWebApi({
      redirectUri: `http://localhost:${process.env.PORT}/api/v1/callback`,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });
  };

  return cachedApi;
  
};

module.exports = {
  getNewSpotifyWebApi,
};
