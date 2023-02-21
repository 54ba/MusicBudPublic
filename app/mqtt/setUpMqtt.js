const mosca = require('mosca');
const chatController = require('../controllers/chat');
const setUpMqtt = async (httpServer) => {

  let ascoltatore = {
    type: 'redis',
    redis: require('redis'),
    db: 12,
    port: 6379,
    return_buffers: true, // to handle binary payloads
    host: "localhost"
  };

    let moscaSettings = {
      port: 1883,
      backend: ascoltatore,
      persistence: {
        factory: mosca.persistence.Redis
      }
    };
 
    let server = new mosca.Server(moscaSettings);
    server.attachHttpServer(httpServer);

    
    server.on('ready', setup);

    server.on('clientConnected', function(client) {
      console.log('server client connected', client.id);
    });
    server.on('clientDisconnected', function(client) {
      console.log('server client disconnected', client.id);
    });

    server.on('published', function(packet, client)  {
      if(client){
           chatController.storeMessage(packet.payload,packet.topic,client.id);
      }
    });

    server.on('subscribed', function(topic, client) {
      chatController.subscribe(topic,client.id);
      console.log('client subscribed to server', topic);
  });

  server.on('unsubscribed', function(topic, client) {
      chatController.unsubscribe(topic,client.id);
        
    console.log('client unsubscribed to server', topic);
  });

}



const setup = (params) => {

    console.log('server MQTT is running');
                
}

module.exports =setUpMqtt;