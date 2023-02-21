const apoc = require("apoc");
const logger = require("../logger");
const { getNewSpotifyWebApi } = require("../helpers/spotifyWebApi");
const spotifyApi = getNewSpotifyWebApi();

const login = (req, res, next) => {
    const scopes = ["user-read-email", "user-read-private", "user-top-read"];

    return res.status(200).json({

        message: "generated authorization link successfully.",
        code: 200,
        status: 'HTTP OK',
        data: { authorization_link: spotifyApi.createAuthorizeURL(scopes) },
    });
};

const callback = async(req, res, next) => {
    const error = req.query.error;
    const code = req.query.code;
    if (error) {
        return next(error);
    }

    try {


        const data = await spotifyApi.authorizationCodeGrant(code);

        const access_token = data.body["access_token"];
        const refresh_token = data.body["refresh_token"];
        const expires_in = data.body["expires_in"];
        console.log("\n" + access_token);

        spotifyApi.setAccessToken(access_token);

        const meItem = await spotifyApi.getMe();
        const me = meItem.body;
        console.log("\n" + me.id);

        let query = "match (user:USER{id:'" + me.id + "'}) return user";

        const result = await apoc.query(query).exec();

        if (!result[0].data.length) {
            query =
                "merge(user:USER{display_name:'" +
                me.display_name +
                "',id:'" +
                me.id +
                "',email:'" +
                me.email +
                "',image:'" +
                // me.images[me.images.length - 1].url +
                "',country:'" +
                me.country +
                "',created_at:datetime(),updated_at:datetime()})";
            console.log("in");

            let { userTopArtists, userTopTrackes } = await getUserTopArtistsAndTracks();

            console.log({ userTopTrackes: userTopTrackes });

            query += mergeUserTopArtistsAndTracksQuery(
                userTopArtists,
                userTopTrackes
            );

            await apoc.query(query).exec();
        } else {
            query =
                "match ( user:USER{id:'" +
                me.id +
                "'}) SET user.access_token = '" +
                access_token +
                "',user.expires_in = " +
                (expires_in - 240).toString() +
                ",user.refresh_token = '" +
                refresh_token +
                "'";

            console.log("out");

            await apoc.query(query).exec();
        }

        return res.json({
            message: "logged in successfully.",
            code: 200,
            status: 'HTTP OK',
            data: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in,
            },
        });
    } catch (e) {
        return next(e);
    }
};

const refreshToken = async(req, res, next) => {
    try {
        const user = req.user;
        spotifyApi.setAccessToken(user.access_token);
        spotifyApi.setRefreshToken(user.refresh_token);
        const new_data = await spotifyApi.refreshAccessToken();
        const expires_in = new_data.body.expires_in - 240;

        query = `match ( user:USER{access_token:'${user.access_token}'}) 
    SET user.access_token = '${new_data.body.access_token}',user.expires_in = '${expires_in}',
    user.refresh_token = '${user.refresh_token}'`;

        await apoc.query(query).exec();
    } catch (error) {
        console.log(error);
    }
    return res.status(200).json({
        message: "refreshed successfully.",
        code: 200,
        status: "HTTP OK",
        data: {
            accessToken: new_data.access_token,
            refreshToken: new_data.refresh_token,
            expiresIn: expiresIn,
        },
    });
};

const updateUserProfile = async(req, res, next) => {
    try {
        let user = req.user;
        spotifyApi.setAccessToken(user.access_token);



        let { userTopArtists, userTopTrackes } = await getUserTopArtistsAndTracks();

        let query = deleteUserLikesQuery(user.id);
        query += mergeUserTopArtistsAndTracksQuery(userTopArtists, userTopTrackes);
        await apoc.query(query).exec();
        return res.status(200).json({

            message: "updated successfully.",
            code: 200,
            status: 'HTTP OK',
        });
    } catch (e) {
        logger.error(e);
        return next(e);
    }
};

const getUserProfile = async(req, res, next) => {
    try {
        let params = {
            id: req.user.id,
            limit: req.body.limit ? req.body.limit : 30,
            skip: req.body.skip ? req.body.skip : 0,
        };

        let query = getUserFullInfoQuery(params);

        const result = await apoc.query(query).exec();
        let collection = {};
        collection.user = getData(result, "user");
        const userTopArtistsIds = getData(result, "user_top_artists");
        const userTopTracksIds = getData(result, "user_top_tracks");


        spotifyApi.setAccessToken(req.user.access_token);
        const topArtistsData = await spotifyApi.getArtists(userTopArtistsIds);
        const topTracksData = await spotifyApi.getTracks(userTopTracksIds);
        collection.topArtists = topArtistsData.body.artists;
        collection.topTracks = topTracksData.body.tracks;

        return res.status(200).json({
            message: "Fetched profile successfully.",
            code: 200,
            status: 'HTTP OK',
            data: collection,
        });
    } catch (e) {
        logger.error(e);
        return next(e);
    }
};

const setAndUpdateUserBio = async(req, res, next) => {
    let id = req.user.id;
    let bio = req.body.bio;

    let query = `match (user{id:'${id}'})
      SET user.bio = '${bio}' `;
    await apoc.query(query).exec();

    try {
        return res.status(200).json({
            defaultResponse: {
                message: "updated bio successfully.",
                code: 200,
                successful: true,
            },
        });
    } catch (e) {
        logger.error(e);
        return next(e);
    }
};

const getBudProfile = async(req, res, next) => {
    try {
        let params = {
            id: req.user.id,
            budId: req.body.budId,
            limit: req.body.limit ? req.body.limit : 30,
            skip: req.body.skip ? req.body.skip : 0,
        };

        query = getCommonAllQuery(params);
        const result = await apoc.query(query).exec();

        let collection = {};
        collection.user = getData(result, "bud");
        const commonArtists = getData(result, "common_artists");
        collection.commonArtistsCount = getData(result, "common_artists_count");
        const commonTracks = getData(result, "common_tracks");
        collection.commonTracksCount = getData(result, "common_tracks_count");
        collection.commonCount = getData(result, "common_count");


        spotifyApi.setAccessToken(user.access_token);
        const commonArtistsData = await spotifyApi.getArtists(commonArtists);
        const commonTracksData = await spotifyApi.getTracks(commonTracks);
        collection.commonArtists = commonArtistsData.body.artists;
        collection.commonTracks = commonTracksData.body.tracks;

        return res.status(200).json({
            message: "Fetched common successfully.",
            code: 200,
            status: '',
            data: collection,
        });
    } catch (e) {
        logger.error(e);
        return next(e);
    }
};

const getCommonArtists = (id, budId) => {
    return `match ( user{ id: '${id}' })-[:LIKES]->(artists:ARTIST) with user,collect(artists) as user_artists_coll
  match (bud{id:'${budId}'})-[:LIKES]->(common_artists:ARTIST) where common_artists in user_artists_coll 
  return collect(distinct common_artists.id) as common_artists ,count(common_artists) as common_artists_count ORDER BY common_artists_count DESC `;
};
const getCommonTracksQuery = (id, budId) => {
    return `match ( user{ id: '${id}' })-[:LIKES]->(tracks:TRACK) with user,collect(tracks) as user_tracks_coll
  match (bud{id:'${budId}'})-[:LIKES]->(common_tracks:TRACK) where common_tracks in user_tracks_coll 
  return collect(distinct common_tracks.id) as common_tracks ,count(common_tracks) as common_tracks_count ORDER BY common_tracks_count DESC `;
};

const getCommonAllQuery = (params) => {
    return `match ( user{ id: '${params.id}' })-[:LIKES]->(user_artists:ARTIST) with user,user_artists,collect(user_artists) as user_artists_coll
  match (bud{id:'${params.budId}'})-[:LIKES]->(common_artists:ARTIST) 
  where common_artists in user_artists_coll
  with user,bud,common_artists 
  match ( user)-[:LIKES]->(user_tracks:TRACK) with bud, common_artists, collect(user_tracks) as user_tracks_coll
  match (bud)-[:LIKES]->(common_tracks:TRACK) where common_tracks in user_tracks_coll with bud,common_artists,common_tracks
  return bud ,collect(distinct common_artists.id)[${params.skip}..${params.skip}+${params.limit}] as common_artists ,count(distinct common_artists) as common_artists_count, collect(distinct common_tracks.id)[${params.skip}..${params.skip}+${params.limit}] as common_tracks,count(distinct common_tracks) as common_tracks_count ,count(distinct common_artists)+count(distinct common_tracks) as common_count ORDER BY common_count  DESC `;
};

const getUserTopArtistsAndTracks = async() => {
    let userTopArtistsItems = await spotifyApi.getMyTopArtists({
        time_range: "long_term",
    });

    let userTopArtists = userTopArtistsItems.body.items.map(
        (element) => element.id
    );

    let userTopTrackesItems = await spotifyApi.getMyTopTracks({
        time_range: "long_term",
    });

    let { total: artistsTotal, limit: artistsLimit } = userTopArtistsItems.body;

    let userTopTrackes = userTopTrackesItems.body.items.map(
        (element) => element.id
    );
    let { total: tracksTotal, limit: tracksLimit } = userTopTrackesItems.body;

    // userTopArtists.push(
    //   ...(await repeatSpotifyRequest( 0, artistsTotal, artistsLimit))
    // );

    // userTopTrackes.push(
    //   ...(await repeatSpotifyRequest( 1, tracksTotal, tracksLimit))
    // );
    return { userTopArtists, userTopTrackes };
};

const repeatSpotifyRequest = async(fnIndex, total, limit) => {
    let epoch = 0;
    let offset = limit;
    let itemsIdsStorage = [];
    let fn = [spotifyApi.getMyTopArtists, spotifyApi.getMyTopTracks];

    while (total > offset) {
        let result = await fn[fnIndex]({
            time_range: "long_term",
            limit: limit,
            offset: offset,
        });
        offset += result.body.offset;
        itemsIdsStorage.push(...result.body.items.map((element) => element.id));

        if (epoch >= 10) break;
        epoch++;
    }

    return itemsIdsStorage;
};

const mergeUserTopArtistsAndTracksQuery = (userTopArtists, userTopTrackes) => {
    let query = "";
    for (let i = 0; i < userTopArtists.length; i++) {
        let artist = userTopArtists[i];
        query += ` merge(artist${i}:ARTIST{id:'${artist}'}) `;
        query += ` merge(user)-[:LIKES]->(artist${i}) `;
    }

    for (let i = 0; i < userTopTrackes.length; i++) {
        let track = userTopTrackes[i];
        query += ` merge(track${i}:TRACK{id:'${track}'}) `;
        query += ` merge(user)-[:LIKES]->(track${i}) `;
    }
    return query;
};

const getUserProfileQuery = (params) => {
    return { leading: `match ( user{id:'${params.id}'}) `, trailing: "user" };
};
const getUserTopArtistsQuery = (params) => {
    return {
        leading: `match ( user{id:'${params.id}'})-[:LIKES]->(artists:ARTIST) `,
        trailing: `collect(distinct artists.id)[${params.skip}..${params.skip}+${params.limit}] as user_top_artists`,
    };
};
const getUserTopTracksQuery = (params) => {
    return {
        leading: `match ( user{id:'${params.id}'})-[:LIKES]->(tracks:TRACK) `,
        trailing: `collect(distinct tracks.id)[${params.skip}..${params.skip}+${params.limit}] as user_top_tracks`,
    };
};
const deleteUserLikesQuery = (params) => {
    return `match (user{id:'${params.id}'})-[r:LIKES]-(likes) delete r `;
};

const getData = (queryResult, variable) => {
    Index = queryResult[0].columns.indexOf(variable);
    return queryResult[0].data[0].row[Index];
};

const getUserFullInfoQuery = (params) => {
    let queryBuilder = { leading: [], trailing: [] };
    let leading, trailing;

    ({ leading, trailing } = getUserProfileQuery(params));
    queryBuilder.leading.push(leading);
    queryBuilder.trailing.push(trailing);

    ({ leading, trailing } = getUserTopArtistsQuery(params));
    queryBuilder.leading.push(leading);
    queryBuilder.trailing.push(trailing);
    ({ leading, trailing } = getUserTopTracksQuery(params));
    queryBuilder.leading.push(leading);
    queryBuilder.trailing.push(trailing);
    return (
        queryBuilder.leading.join(" ") +
        " return " +
        queryBuilder.trailing.join(",")
    );
};

module.exports = {
    login,
    callback,
    refreshToken,
    updateUserProfile,
    getUserProfile,
    getBudProfile,
    setAndUpdateUserBio,
};