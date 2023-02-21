const apoc = require("apoc");

const SpotifyWebApi = require("spotify-web-api-node");
const logger = require("../logger");

const login = (req, res, next) => {
  const scopes = ["user-read-email", "user-read-private", "user-top-read"];

  const spotifyApi = new SpotifyWebApi({
    redirectUri: `http://localhost:${process.env.PORT}/api/v1/callback`,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  return res.send(spotifyApi.createAuthorizeURL(scopes));
};

const callback = async (req, res, next) => {
  // const error = req.query.error;
  // const code = req.query.code;

  const spotifyApi = new SpotifyWebApi({
    redirectUri: `http://localhost:${process.env.PORT}/api/v1/callback`,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  // if (error) {
  //   return next(error);
  // }

  // const data = await spotifyApi.authorizationCodeGrant(code);
  // Set the access token
  //  spotifyApi.setAccessToken(data.body['access_token']);
  //  console.log(data.body['access_token']);
  const access_token =
    "BQDn-KSJNcvbIYumgzrkk7hdLm4AldqAmPVZ6ISFJGFHFSBWFTCNbjsmuX89kzbRbnlrexVMwB632s2cu3Fim180_FA2d4KaBoviGtsWAd1Zk1ggNUG0mxPdPuPjDPTzQYk3PUIRgIkf-eVi-Ua-sL99O2OZBUuM";
  spotifyApi.setAccessToken(access_token);

  const meItem = await spotifyApi.getMe();
  const me = meItem.body;
  var query = `match (user:User{id:'${me.id}'}) return user`;
  try {
    const existedUser = await apoc.query(query).exec();
    let myTopArtists = "none";
    let myTopTrackes = "none";
    if (!existedUser[0].data[0].row[0].id) {
      query = `merge(user:User{displayName:'${me.display_name}',
      id:'${me.id}',
      email:'${me.email}',
      image:'${me.images[me.images.length - 1].url}',
      country:'${me.country}',
      created_at:datetime(),
      updated_at:datetime()
    })`;

      // TODO:: limit offset

      // to enable artist related genres

      // var myTopArtistsAndGenres = 'none';
      //  const myTopArtistsItems = await spotifyApi.getMyTopArtists({time_range:'long_term'});
      //  myTopArtistsAndGenres = myTopArtistsItems.body.items.map((element)=>  {
      //   return {
      //   ids:element.id,
      //   genres:element.genres
      //   }
      //   });
      // myTopArtists = myTopArtistsAndGenres.map((element)=>element.ids);
      // myTopGenres = myTopArtistsAndGenres.map((element)=>element.genres);

      
      {myTopArtists,myTopTrackes} = await getMyTopArtistsAndTracks(spotifyApi);

      await mergeMyTopArtistsAndTracks(myTopArtists,myTopTrackes);

      for (let i = 0; i < myTopArtists.length; i++) {
        let artist = myTopArtists[i];
        query += ` merge(artist${i}:ARTIST{id:'${artist}'})`;
        query += ` merge(user)-[:LIKES]->(artist${i})`;
      }

      for (let i = 0; i < myTopTrackes.length; i++) {
        let track = myTopTrackes[i];
        query += ` merge(track${i}:TRACK{id:'${track}'})`;
        query += ` merge(user)-[:LIKES]->(track${i})`;
      }

      await apoc.query(query).exec();
    }
    return res.json({
      //  access_token:data.body['access_token']
      success: "success",
    });
  } catch (e) {
    logger.error(e);
    return res.json(e.stack);
  }
};

//   const setUserProfile = (req, res, next) => {

// query=`merge(user:User{displayName:'${user.displayName}',
//     id:'${user.id}',
//     birthDate:'${user.birthDate}',
//     created_at:datetime(),
//     updated_at:datetime(),
//     country:'${user.country}'})`;

//         mergeUserTopArtistsAndTracks(user,query )
//         .then(()=>{

//          return res.status(200).json({'message':'success'});

//        }).catch((e)=>{   if (!e.statusCode) {
//         e.statusCode = 500;
//       }
//       return next(e);});

//   }

const getMyTopArtistsAndTracks = async (spotifyApi)=>
{
  const myTopArtistsItems = await spotifyApi.getMyTopArtists({
    time_range: "long_term",
  });
  myTopArtists = myTopArtistsItems.body.items.map((element) => element.id);
  const myTopTrackesItems = await spotifyApi.getMyTopTracks({
    time_range: "long_term",
  });
  myTopTrackes = myTopTrackesItems.body.items.map((element) => element.id);
  return {myTopArtists,myTopTrackes}

}

const refreshUserProfile = (req, res, next) => {
  let user = req.body;

  deleteUserRelationsToLikes(user.id)
    .then(() => {
      mergeUserTopArtistsAndTracks(user, (query = ""))
        .then(() => {
          return res.status(200).json({ message: "success" });
        })
        .catch((e) => {
          if (!e.statusCode) {
            e.statusCode = 500;
          }
          return next(e);
        });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      return next(e);
    });
};

const getUserProfile = (req, res, next) => {
  let params = {
    id: req.body.id,
  };
  let collection = {};

  Promise.all([
    getUserCustomData(params.id),
    getUserTopArtists(params.id),
    getUserTopTracks(params.id),
    getUserTopGenres(params.id),
  ])
    .then(([customData, topArtists, topTracks, topGenres]) => {
      userIndex = customData[0].columns.indexOf("user");
      collection.user = customData[0].data[0].row[userIndex];
      imageIndex = customData[0].columns.indexOf("image");
      collection.user.image = customData[0].data[0].row[imageIndex];
      collection.top_artists = topArtists[0].data[0].row[0];
      collection.top_tracks = topTracks[0].data[0].row[0];
      collection.top_genres = topGenres[0].data[0].row[0];
      console.log(customData[0].data[0].row[imageIndex]);

      return res.status(200).json(collection);
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      return next(e);
    });
};
//TODO
const setAndUpdateUserBio = (req, res, next) => {
  // let id = req.body.id;

  let bio = req.body.bio;

  query = `match (user{id:'${id}'})
      SET user.bio = '${bio}'`;
  apoc
    .query(query)
    .exec()
    .then(() => {
      return res.status(200).json({ message: "success" });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }
      return next(e);
    });
};

const getUserCustomData = (id) => {
  query = `match ( user{id:'${id}'}) return user`;
  return apoc.query(query).exec();
};
const getUserTopArtists = (id) => {
  query = `match ( user{id:'${id}'})-[:LIKES]->(artists:ARTIST) with collect(artists) as user_artists
    return user_artists`;
  return apoc.query(query).exec();
};
const getUserTopTracks = (id) => {
  query = `match ( user{id:'${id}'})-[:LIKES]->(tracks:TRACK) with collect(tracks) as user_tracks
    return user_tracks`;
  return apoc.query(query).exec();
};
const deleteUserRelationsToLikes = (id) => {
  query = `match (user{id:'${id}'})-[r:LIKES]-(likes) delete r`;
  return apoc.query(query).exec();
};

module.exports = {
  login,
  callback,
  getUserProfile,
  refreshUserProfile,
  setAndUpdateUserImage,
  setAndUpdateUserBio,
  getUserProfile,
};
