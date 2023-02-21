const apoc = require('apoc');
const logger = require('../logger');

module.exports = {
    createChannel:function(){
        return createChannel = (req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId
            }
            if(isCreator(params)){
                query = `merge ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO{creator:'1'}]->(channel:Channel{id:'${params.channelId}'})`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'created successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
    
                }else{
                    res.status(401).json({'message':'unAuthorized'});                  
                };

        }
    }, deleteChannel:function(){
        return deleteChannel = (req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId
            }

            if(isCreator(params)){
            query = `match ( user:User{id:'${params.id}'})-[s1:SUBSCRIBEDTO{creator:'1'}]->(channel:Channel{id:'${params.channelId}'})<-[s2:SUBSCRIBEDTO]-(plebs:User) delete s1,s2,channel`;
            apoc.query(query).exec().then(
                (queryResult)=> {
                    logger.info(queryResult);
                    return res.status(200).json({'message':'deleted successfully'});
                }, function (fail) {
                    logger.error(fail);
                });

            }else{
                res.status(401).json({'message':'unAuthorized'});                  
            };
        }
    },changeChannelName:function(){
        return changeChannelName = (req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                channelName:req.body.channelName
            }
            
            if(isCreator(params)){
                query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO{creator:'1'}]->(channel:Channel{id:'${params.channelId}'}) set channel.name:'${params.channelName}'`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'changed name successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }
        }
    },addModeratorToChannel:function(){
        return addModeratorToChannel=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                plebId:req.body.plebId
            }

            if(isCreator(params)){
                query = `match ( pleb:User{id:'${params.plebId}'})-[s:SUBSCRIBEDTO]->(channel:Channel{id:'${params.channelId}'}) set s.moderator:'1'`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'admin added successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }

        }
    },removeModeratorFromChannel:function(){
        return removeModeratorFromChannel = (req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                plebId:req.body.plebId
            }
            if(isCreator(params)){
                query = `match ( pleb:User{id:'${params.plebId}'})-[s:SUBSCRIBEDTO{moderator:'1'}]->(channel:Channel{id:'${params.channelId}'}) remove s.moderator`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'admin deleted successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }
        }
    },getInvitedUsers:function(){
        return getInvitedUsers=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
            } 
            

            if(isCreator(params) || isModerator(params)){
                query = `match (user:User)-[:INVITEDTO]->(channel:Channel{id:'${params.channelId}'})  
                return collect(user) as users`;
                let collection ={};
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        usersIndex = queryResult[0].columns.indexOf('users');
                        collection.users=data[0].data[0].row[usersIndex];
                        return collection;
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }
        }
    },approveUserToChannel:function(){
        return approveUserToChannel=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                invitedUserId:req.body.invitedUserId
            } 

            if(isCreator(params) || isModerator(params)){
                query = `match (invited_user :User{id:'${params.invitedUserId}'})-[old:INVITEDTO]->(channel:Channel{id:'${params.channelId}'}) 
                create (invited_user)-[new:SUBSCRIBEDTO]->(channel) 
                delete old`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'user added successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }

        }
    },declineUserToChannel:function(){
        return declineUserToChannel=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                invitedUserId:req.body.invitedUserId
            } 

            if(isCreator(params) || isModerator(params)){
                query = `match (invited_user :User{id:'${params.invitedUserId}'})-[old:INVITEDTO]->(channel:Channel{id:'${params.channelId}'}) 
                delete old`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'user declined successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }

        }
    },removeUserFromChannel:function(){
        return removeUserFromChannel=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                pleb:req.body.plebId
            } 

            if(isCreator(params) || isModerator(params)){
                query = `match (pleb :User{id:'${params.plebId}'})-[s:SUBSCRIBEDTO]->(channel:Channel{id:'${params.channelId}'}) 
                delete s`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'user removed successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }

        }
    },inviteUserToChannel:function(){
        return inviteUserToChannel=(req,res,next)=>{
            let params = {
                id:req.body.id,
                channelId:req.body.channelId,
                invitedUserId:req.body.invitedUserId
            } 

            if(isInChannel(params)){
                query = `match (invited_user :User{id:'${params.invitedUserId}'}) 
                create (invited_user)-[:INVITEDTO]->(channel:Channel{id:'${params.channelId}'})`;
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        logger.info(queryResult);
                        return res.status(200).json({'message':'user invited successfully'});
                    }, function (fail) {
                        logger.error(fail);
                    });
            }else{
                res.status(401).json({'message':'unAuthorized'});
            }

        }
    },getUserSubscribedChannels:function(){
        return getUserSubscribedChannels = (req, res, next) => {
        let params = {
            id:req.body.id
          };

          module.exports.getUserSubscribedChannelsQuery(params).then((collection)=>{
            return res.status(200).json({collection});

          }).catch((e)=>{  res.status(400).json({'message':e.message})});

        } 
    }, getUserPrivateChatsWithLastMessages:function(){
        return getUserPrivateChatsWithLastMessages = (req, res, next) => {
        let params = {
            id:req.body.id,
            limit:30
            
          };

          module.exports.getUserPrivateChatsWithLastMessagesQuery(params).then((collection)=>{
            return res.status(200).json({collection});

          }).catch((e)=>{  res.status(400).json({'message':e.message})});
        }
    },getUserPrivateChatsAndChannelsWithLastMessages:function(){
        return getUserPrivateChatsAndChannelsWithLastMessages=(req,res,next) =>{
            let params = {
                id:req.body.id,
                limit:30
                
              };
              module.exports.getUserPrivateChatsAndChannelsWithLastMessagesQuery(params).then((collection)=>{
                return res.status(200).json({collection});
    
              }).catch((e)=>{  res.status(400).json({'message':e.message})});
        }
    },getChannelPlebs:function(){
        return getChannelPlebs = (req, res, next) => {
            let params = {
                id:req.body.id,
                channelId:req.body.channelId
              };
              if(isInChannel(params)){
                query = `match (pleb:User)-[:SUBSCRIBEDTO]->(channel:Channel{id:'${params.channelId}'}) return collect(pleb) as plebs`;
                let collection={};
                apoc.query(query).exec().then(
                    (queryResult)=> {
                        plebsIndex = queryResult[0].columns.indexOf('plebs');
                        collection.plebs=data[0].data[0].row[plebsIndex];
                        return collection;
                    }, function (fail) {
                        logger.error(fail);
                    });
              }else{
                res.status(401).json({'message':'unAuthorized'});
              }
        }

    },getChannelMessages:function(){
        return getChannelMessages = (req, res, next) => {
        let params = {
            id:req.body.id,
            channelId:req.body.channelId,
            limit:req.body.limit?req.body.limit:30,
            skip:req.body.skip?req.body.skip:0
          };

          module.exports.getChannelMessagesQuery(params).then((collection)=>{
            return res.status(200).json({collection});

          }).catch((e)=>{  res.status(400).json({'message':e.message})});
        }
    } , getChatMessages:function(){
        return getChatMessages = (req, res, next) => {
        let params = {
            id:req.body.id,
            budId:req.body.budId,
            chatId:req.body.chatId,
            limit:req.body.limit?req.body.limit:30,
            skip:req.body.skip?req.body.skip:0
          };

          module.exports.getChatMessagesQuery(params).then((collection)=>{
            return res.status(200).json({collection});

          }).catch((e)=>{  res.status(400).json({'message':e.message})});
        }
    } ,
    
    
    
    getUserSubscribedChannelsQuery : (params)=>{
        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(channels:CHANNEL) with user, collect(channels) as channels
        return user,channels `;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            channelsIndex = data[0].columns.indexOf('channels');
            collection.channels=data[0].data[0].row[channelsIndex];
            return collection;
        }).catch((e)=>{logger.info({'message':e.message})});

    
    }, getUserPrivateChatsQuery : (params)=>{
        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(chats:Chat)<-[:SUBSCRIBEDTO]-(bud:User) with user,bud,collect(chats) as chats
        return user,bud,chats `;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            chatsIndex = data[0].columns.indexOf('chats');
            collection.chats=data[0].data[0].row[chatsIndex];
            return collection;
        }).catch((e)=>{logger.info({'message':e.message})});

    
    }, getUserPrivateChatsWithLastMessagesQuery : (params)=>{
        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(chats:Chat)-[:CONTAINS]->(messages:Message) with user,collect(chats) as chats,collect(messages) as messages
        return user,chats,messages order by messages.created_at limit ${params.limit}`;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            chatsIndex = data[0].columns.indexOf('chats');
            collection.chats=data[0].data[0].row[chatsIndex];
            resolve(collection); 
        }).catch((e)=>{logger.info({'message':e.message})});

    
    },getUserPrivateChatsAndChannelsWithLastMessagesQuery:(params)=>{

        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(chatsAndChannels)-[:CONTAINS]->(messages:Message) with user,collect(chatsAndChannels) as chatsAndChannels,collect(messages) as messages
        return user,chatsAndChannels,messages order by messages.created_at limit ${params.limit}`;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            chatsAndChannelsIndex = data[0].columns.indexOf('chatsAndChannels');
            collection.chatsAndChannels=data[0].data[0].row[chatsAndChannelsIndex];
            resolve(collection); 
        }).catch((e)=>{logger.info({'message':e.message})});

    },getChannelMessagesQuery : (params)=>{
        
        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(channel:Channel{id:'${params.channelId}'})-[:CONTAINS]->(messages:Message)-[:PUBLISHEDBY]->(buds:User) with user,buds,collect(messages) as messages
        return user,buds,messages order by messages.created_at limit ${$params.limit} skip ${params.skip}`;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            budsIndex = data[0].columns.indexOf('buds');
            collection.buds=data[0].data[0].row[budsIndex];
            messagesIndex = data[0].columns.indexOf('messages');
            collection.messages=data[0].data[0].row[messagesIndex];
            return collection;
        }).catch((e)=>{logger.info({'message':e.message})});

    
    }, getChatMessagesQuery : (params)=>{
        query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(chat:Chat{id:'${params.chatId}'})-[:CONTAINS]->(messages:Message),(chat)<-[:SUBSCRIBED]-(bud:User{id:'${$params.budId}'}) with user,buds,collect(messages) as messages
        return user,bud,messages order by messages.created_at limit ${$params.limit} skip ${params.skip}`;
        let collection={};

        return apoc.query(query).exec().then((data)=>{
            userIndex = data[0].columns.indexOf('user');
            collection.user=data[0].data[0].row[userIndex];
            budIndex = data[0].columns.indexOf('bud');
            collection.bud=data[0].data[0].row[budIndex];
            messagesIndex = data[0].columns.indexOf('messages');
            collection.messages=data[0].data[0].row[messagesIndex];
            return collection;
        }).catch((e)=>{logger.info({'message':e.message})});

    
    },
    storeMessage : (message,topic,user_id)=>{
        topicType = topic.split("/")[0];
        if(topicType.indexOf('chat') > -1) {
            storeChatMessage(message,topic,user_id);
        }else if(topicType.indexOf('channel') > -1){
            storeChannelMessage(message,topic,user_id);

        }
    },
    subscribe:(topic,user_id)=>{
        topicType = topic.split("/")[0];
        if(topicType.indexOf('chat') > -1) {
            subscribeToChat(topic,user_id);
        }else if(topicType.indexOf('channel') > -1){
            subscribeToChannel(topic,user_id);
        }
    },
    unsubscribe:(topic,user_id)=>{
        topicType = topic.split("/")[0];
        if(topicType.indexOf('chat') > -1) {
            unsubscribeToChat(topic,user_id);
        }else if(topicType.indexOf('channel') > -1){
            unsubscribeToChannel(topic,user_id);
        }
    }


}

const isCreator = (params)=>{
    query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO{creator:'1'}]->(channel:Channel{id:'${params.channelId}'}) return count(channel) as channel_count`;
    apoc.query(query).exec().then(
        (queryResult)=> {
            channelCountIndex = data[0].columns.indexOf('channel_count');
            if(queryResult[0].data[0].row['channelCountIndex'] ==1  ){
               return true;

            }else{
                return false;                  
            };
        },
        function (fail) {
          logger.error(fail);
        });

};

const isModerator = (params)=>{
    query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO{moderator:'1'}]->(channel:Channel{id:'${params.channelId}'}) return count(channel) as channel_count`;
    apoc.query(query).exec().then(
        (queryResult)=> {
            channelCountIndex = data[0].columns.indexOf('channel_count');
            if(queryResult[0].data[0].row['channelCountIndex'] ==1  ){
               return true;

            }else{
                return false;                  
            };
        },
        function (fail) {
          logger.error(fail);
        });

};


const isInChannel = (params)=>{
    query = `match ( user:User{id:'${params.id}'})-[:SUBSCRIBEDTO]->(channel:Channel{id:'${params.channelId}'}) return count(channel) as channel_count`;
    apoc.query(query).exec().then(
        (queryResult)=> {
            channelCountIndex = data[0].columns.indexOf('channel_count');
            if(queryResult[0].data[0].row['channelCountIndex'] ==1  ){
               return true;

            }else{
                return false;                  
            };
        },
        function (fail) {
          logger.error(fail);
        });

};

const storeChatMessage = (message,topic,user_id)=>{
    query = `match ( user:User{id:'${user_id}'})-[r:SUBSCRIBEDTO]->(chat:Chat{id:'${topic}'})
    merge (chat)-[:CONTAINS]->(message:Message{content:'${message}', created_at:datetime()})-[:PUBLISHEDBY]->(user)`;
    apoc.query(query).exec().then(
        (queryResult)=> {
         logger.info(queryResult);
        },
        function (fail) {
          logger.error(fail);
        });
};

const storeChannelMessage = (message,topic,user_id)=>{
    query = `match ( user:User{id:'${user_id}'})-[r:SUBSCRIBEDTO]->(channel:Channel{id:'${topic}'})
    merge (channel)-[:CONTAINS]->(message:Message{content:'${message}', created_at:datetime()})-[:PUBLISHEDBY]->(user)`;
    apoc.query(query).exec().then(
        (queryResult)=> {
         logger.info(queryResult);
        },
        function (fail) {
          logger.error(fail);
        });
};

const subscribeToChat = (topic,user_id)=>{
    //TODO::topic id
        query = `merge ( user:User{id:'${user_id}'})-[:SUBSCRIBEDTO]->(chat:Chat{id:'${topic}'})`;
        apoc.query(query).exec().then(
            (queryResult)=> {
             logger.info(queryResult);
            },
            function (fail) {
              logger.error(fail);
            });
};

const subscribeToChannel = (topic,user_id)=>{
       //TODO::topic id

    query = `merge ( user:User{id:'${user_id}'})-[:SUBSCRIBEDTO]->(channel:Channel{id:'${topic}'})`;
    apoc.query(query).exec().then(
        (queryResult)=> {
         logger.info(queryResult);
        },
        function (fail) {
          logger.error(fail);
        });
};

const unsubscribeToChat = (topic,user_id)=>{
       //TODO::topic id

    query = `match (user:User{id:'${id}'})-[r:SUBSCRIBEDTO]->(chat:Chat{id:'${topic}'}) delete r`;
    return apoc.query(query).exec().then(
        (queryResult)=> {
         logger.info(queryResult);
        },
        function (fail) {
          logger.error(fail);
        });
};

const unsubscribeToChannel = (topic,user_id)=>{
        //TODO::topic id

    query = `match (user:User{id:'${id}'})-[r:SUBSCRIBEDTO]->(channel:Channel{id:'${topic}'}) delete r`;
    return apoc.query(query).exec().then(
        (queryResult)=> {
         logger.info(queryResult);
        },
        function (fail) {
          logger.error(fail);
        });
};

