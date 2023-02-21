const apoc = require("apoc");
const getBudsByArtists = async(req, res, next) => {
    let params = {
        id: req.user.id,
        limit: req.body.limit ? req.body.limit : 30,
        skip: req.body.skip ? req.body.skip : 0,
    };

    let query = getBudsByArtistsQuery(params);

    const result = await apoc.query(query).exec();

    let collection = {};
    collection.buds = getData(result, "buds");
    collection.commonArtistsCount = getData(result, "common_artists_count");

    return res.status(200).json({
        message: "Fetched buds successfully.",
        code: 200,
        successful: true,
        data: collection,
    });
};
const getBudsByTracks = async(req, res, next) => {
    let params = {
        id: req.user.id,
        limit: req.body.limit ? req.body.limit : 30,
        skip: req.body.skip ? req.body.skip : 0,
    };

    let query = getBudsByTracksQuery(params);
    const result = await apoc.query(query).exec();

    let collection = {};
    collection.buds = getData(result, "buds");
    collection.commonTracksCount = getData(result, "common_tracks_count");

    return res.status(200).json({
        message: "Fetched buds successfully.",
        code: 200,
        successful: true,
        data: collection,
    });
};

const getBudsByArtistsAndTracks = async(req, res, next) => {
    let params = {
        id: req.user.id,
        limit: req.body.limit ? req.body.limit : 30,
        skip: req.body.skip ? req.body.skip : 0,
    };

    let query = getBudsByArtistsAndTracksQuery(params);

    const result = await apoc.query(query).exec();

    let collection = {};
    collection.buds = getData(result, "buds");
    collection.commonArtistsCount = getData(result, "common_artists_count");
    collection.commonTracksCount = getData(result, "common_tracks_count");
    collection.commonCount = getData(result, "common_count");

    return res.status(200).json({

        message: "Fetched buds successfully.",
        code: 200,
        successful: true,
        data: collection,
    });
};

const getData = (queryResult, variable) => {
    Index = queryResult[0].columns.indexOf(variable);
    return queryResult[0].data[0].row[Index];
};

const getBudsByArtistsQuery = (params) => {
    return `match ( user{ id: '${params.id}' })-[:LIKES]->(user_artists:ARTIST) with user,collect(user_artists) as user_artists_coll
  match (buds)-[:LIKES]->(common_artists:ARTIST) where common_artists in user_artists_coll and buds <> user with buds,common_artists
  return buds limit ${params.limi} skip ${params.skip},collect(distinct common_artists.id) as common_artists ,count(distinct common_artists) as common_artists_count ORDER BY common_artists_count DESC`;
};

const getBudsByTracksQuery = (params) => {
    return `match ( user{ id: '${params.id}' })-[:LIKES]->(user_tracks:TRACK) with user,collect(user_tracks) as user_tracks_coll
  match (buds)-[:LIKES]->(common_tracks:TRACK) where common_tracks in user_tracks_coll and buds <> user with buds,common_tracks
  return buds limit ${params.limit} skip ${params.skip},collect(distinct common_tracks.id) as common_tracks ,count(distinct common_tracks) as common_tracks_count ORDER BY common_tracks_count DESC`;
};

const getBudsByArtistsAndTracksQuery = (params) => {
    return `match ( user{ id: '${params.id}' })-[:LIKES]->(user_artists:ARTIST) with user,user_artists,collect(user_artists) as user_artists_coll
  match (buds)-[:LIKES]->(common_artists:ARTIST) 
  where common_artists in user_artists_coll and buds <> user 
  with user,buds,common_artists 
  match ( user)-[:LIKES]->(user_tracks:TRACK) with buds, common_artists, collect(user_tracks) as user_tracks_coll
  match (buds)-[:LIKES]->(common_tracks:TRACK) where common_tracks in user_tracks_coll with bud,common_artists,common_tracks
  return buds limit ${params.limit} skip ${params.skip},collect(distinct common_artists.id) as common_artists ,count(distinct common_artists) as common_artists_count, collect(distinct common_tracks.id) as common_tracks,count(distinct common_tracks) as common_tracks_count ,count(distinct common_artists)+count(distinct common_tracks) as common_count ORDER BY common_count  DESC `;
};

//expermintal -------------------------------


// -------------------------------

module.exports = {
    getBudsByArtists,
    getBudsByTracks,
    getBudsByArtistsAndTracks,
};