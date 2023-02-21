const apoc = require('apoc');


let user = {
    displayName: 'rizq',
    id:'8454545',
    country:'EG',
    birthDate:'2013-11-13',
    top_artists:[{
            href:'https://api.spotify.com/v1/artists/ef5pcrzusfmn5vhcpcgntwa4p',
            id:'ef5pcrzusfmn5vhcpcgntwa4p',
            name:'joy divion',
            images:[{url:'https://i.scdn.co/image/d5ac5dc59664cf7c64795271602316dde494a6d1'},
                {url:'https://i.scdn.co/image/2f0da0cf65c956f29932dbaea5f9ca19d35cf6c0'},
                {url:'https://i.scdn.co/image/5cdf2472d3eda9efc1a0b2bb8bc5d38ae2597fae'}
            ],
            genres:[{
                name:'rock'
            },
            {name:'alt rock'},
            {name:'indie rock'}
        ],
            type:'artist',
            uri:'spotify:user:ef5pcrzusfmn5vhcpcgntwa4p'

        },
        {
            href:'https://api.spotify.com/v1/artists/1RyvyyTE3xzB2ZywiAwp0i',
            id:'1RyvyyTE3xzB2ZywiAwp0i',
            name:'cheb gedid',
            images:[{url:'https://i.scdn.co/image/d5ac5dc596s64cf7c64795271602316dde494a6d1'},
                {url:'https://i.scdn.co/image/2f0da0cf65c956f29s932dbaea5f9ca19d35cf6c0'},
                {url:'https://i.scdn.co/image/5cdf2472d3eda9efcs1a0b2bb8bc5d38ae2597fae'}
            ],
            genres:[
                {name:'arabic hip hop'}
            ],
            type:'artist',
            uri:'spotify:user:1RyvyyTE3xzB2ZywiAwp0i'

        },
        {
            href:'https://api.spotify.com/v1/artists/46SHBwWsqBkxI7EeeBEQG7',
            id:'46SHBwWsqBkxI7EeeBEQG7',
            name:'Opeth',
            images:[{url:'https://i.scdn.co/image/d5acs5dc596s64cf7c64795271602316dde494a6d1'},
                {url:'https://i.scdn.co/image/2f0da0cf65cs956f29s932dbaea5f9ca19d35cf6c0'},
                {url:'https://i.scdn.co/image/5cdf2472d3seda9efcs1a0b2bb8bc5d38ae2597fae'}
            ], genres:[
                {name:'alternative metal'},
                {name:'death metal'},
                {name:'groove metal'},
                {name:'metal'},
                {name:'rock'},
               ],
            type:'artist',
            uri:'spotify:user:46SHBwWsqBkxI7EeeBEQG7'

        }

    ],
    top_tracks:[{
        album:{
            albumType:'ALBUM',
            href:'https://api.spotify.com/v1/albums/51V7Z3khoGyNTviYMQLK4b',
            id:'51V7Z3khoGyNTviYMQLK4b',
            images:[{url:'https://i.scdn.co/image/ab67616d0000b2735f84679f86ed8c3c2fefeea2'}],
            name:'Sindibad el Ward',
            releaseDate:'2019-08-18',
            totalTracks:'13',
            type:'album',
            uri:'spotify:album:51V7Z3khoGyNTviYMQLK4b'
        },
        artists:[{
            href:'https://api.spotify.com/v1/artists/5qvrUMJ8oO3BswrQO3w0hl',
            id:'5qvrUMJ8oO3BswrQO3w0hl',
            name:'Al Nather',
            type:'artist',
            uri:'spotify:artist:5qvrUMJ8oO3BswrQO3w0hl'
        }
        ],
        href:'https://api.spotify.com/v1/tracks/2tGkpgqffPVPMY74kLCCHz',
        id:'2tGkpgqffPVPMY74kLCCHz',
        name:'Madraseh',
        type:'track',
        uri:'spotify:track:2tGkpgqffPVPMY74kLCCHz'
        }

    ]

}



query = '';

query+=`merge(user:User{displayName:'${user.displayName}',
    birthDate:'${user.birthDate}',
    country:'${user.country}'})`;

//top artists query 
for (let i = 0; i < user.top_artists.length; i++) {
    let artist = user.top_artists[i];
    

    query+=`merge(artist${i}:ARTIST{href:'${artist.href}',
    id:'${artist.id}',
    name:'${artist.name}',
    type:'${artist.type}',
    uri:'${artist.uri}'})`; 

    query+=`merge(user)-[:LIKES]->(artist${i})`;

    for (let i2 = 0; i2 < artist.genres.length; i2++) {
        let genre = artist.genres[i2];
        query+= ` merge(genre${i+''+i2}:GENRE{name:'${genre.name}'})
        merge (artist${i})-[:PLAYS]->(genre${i+''+i2})`;
        
    }
    for (let i3 = 0; i3 < artist.images.length; i3++) {
        let image = artist.images[i3];
        query+=` merge(artistImage${i+''+i3}:ARTISTIMAGE{url:'${image.url}'})
        merge (artist${i})-[:OWNS]->(artistImage${i+''+i3})`;  
    
    }
    
}

//top tracks query 
for (let i = 0; i < user.top_tracks.length; i++) {
    let track = user.top_tracks[i];

    query+=`merge(track${i}:TRACK{href:'${track.href}',
    id:'${track.id}',
    name:'${track.name}',
    type:'${track.type}',
    uri:'${track.uri}'})`; 

   
    query+=`merge(user)-[:LIKES]->(track${i})`;

    for (let i2 = 0; i2 < track.artists.length; i2++) {
        let trackArtist = track.artists[i2];
        query+= ` merge(trackArtist${i+''+i2}:TRACKARTIST{href:'${trackArtist.href}',
        id:'${trackArtist.id}',
        name:'${trackArtist.name}',
        type:'${trackArtist.type}',
        uri:'${trackArtist.uri}'})
        merge (track${i})-[:PRODUCEDBY]->(trackArtist${i+''+i2})`;
        
    }

    let album = track.album;
    query+=`merge(album${i}:ALBUM{albumType:'${album.albumType}',
    href:'${album.href}',
    id:'${album.id}',
    name:'${album.name}',
    releaseDate:'${album.releaseDate}',
    totalTracks:'${album.releaseDate}',
    type:'${album.type}',
    uri:'${album.uri}'})`; 

    query+=`merge(track${i})-[:INALBUM]->(album${i})`;

    for (let i3 = 0; i3 < album.images.length; i3++) {
        let image = album.images[i3];
        query+=` merge(albumImage${i+''+i3}:ALBUMIMAGE{url:'${image.url}'})
        merge (album${i})-[:OWNS]->(albumImage${i+''+i3})`;  
    
    }


}


const fs = require('fs');
fs.writeFile('user.json', JSON.stringify(user), (err) => {
    if (err) throw err;
    console.log('user saved!');
});
// apoc.query(query).exec().then(
//                   (queryResult)=> {
//                    console.log(queryResult);
//                   },
//                   function (fail) {
//                     console.log(fail)
//                   });
// apoc.query(`merge (user:User{email:'${faker.internet.email()}',
//     password:'${faker.internet.password()}',
//     birthDate:'${faker.date.past(10)}',
//     country:'${faker.address.country()}',
//     displayName:'${faker.name.findName()}') 

// merge(artist:Artist{href:'${faker.internet.url()}',
//     name:'${faker.name.findName()}',
//     type:'${faker.name.findName()}',
//     uri:'${faker.internet.url()}')  
// merge(track:Track{href:'${faker.internet.url()}',
//     id:'${faker.random.number()}',
//     name:'${faker.name.findName()}',
//     type:'${faker.name.findName()}',
//     uri:'${faker.internet.url()}'
// })  
// merge(image:Image{url:'${faker.internet.url()}'})  
// merge(genre:Genre{name:'${faker.name.findName()}'}) 
// merge (user)-[:LIKES]->(artist)
// merge (user)-[:LIKES]->(track)
// merge (user)-[:LIKES]->(genre)
// merge (artist)-[:HAS]->(image)
// merge (artist)-[:PLAYS]->(genre)


// `
//           )
//           .exec().then(
//               (queryResult)=> {
//                console.log(queryResult);
//               },
//               function (fail) {
//                 console.log(fail)
//               });