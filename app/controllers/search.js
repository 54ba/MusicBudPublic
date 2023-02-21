const apoc = require("apoc");
const logger = require("../logger");

searchChannelsAndUsers = async (req, res, next) => {
  let params = {
    query: req.body.query,
  };
  // let query = `match users = ( user:USER) WHERE user.display_name =~ '.*${params.query}.*' , channels = ( channel:CHANNEL) WHERE channel.id =~ '.*${params.query}.*'
  //             return collect(distinct users) as users ,collect(distinct channels) as channels`;
  let query = `match users = ( user:USER) WHERE user.display_name =~ '.*${params.query}.*' 
              return collect(distinct users) as users `;
  let collection = {};
  try {
    const result = await apoc.query(query).exec();
    collection.users = getData(result, "users");
    // collection.channels = getData(result, "channels");

    return res.status(200).json({
      defaultResponse: {
        message: "Fetched search result successfully.",
        code: 200,
        successful: true,
      },
      collection,
    });
  } catch (e) {
    logger.error(e);
    return res.json(e);
  }
};

const getData = (queryResult, variable) => {
  Index = queryResult[0].columns.indexOf(variable);
  return queryResult[0].data[0].row[Index];
};
module.exports = {
  searchChannelsAndUsers,
};
