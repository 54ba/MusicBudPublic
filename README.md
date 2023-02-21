<h1 align="center">
MusicBud </h1>

<h5 align="center">
 REST API matches users with similar taste in music based on Spotify API.
 </h5>

<h5 align="center">The project is in progress</h5>

### Functions

<strong>Buds functions</strong>

Find buds profile with common:

- artist
- track
- artist and track

<strong>User profile</strong>

- retrieve also set and update user and buds profiles including bio, tracks, and artists
  search
- searching for users and channels name

<strong>User account</strong>

- login
- refresh token
- update profile by replacing the old data from Spotify with the new one

<strong>Chat</strong>

- chat with buds
- create channel
- invite buds
- join channels
- etc...

<strong>using:</strong>

- Nodejs
- Express Framework
- Database Graph Neo4j
- Chat Mqtt using apoc

### NEW automated Guidee

0. install docker desktop
1. start docker desktop app
2. clone the repo

```
git clone https://github.com/54ba/MusicBud.git
```

3- open cmd

```
docker-compose up -d
docker-compose run nodejs run npm install
```

Now it' up <br />
hit

hit `http://localhost:3000/docs/` for docs


Don't forget to edit .env with Spotify app credentials

### Generating new ssl cert

<em>Do this prior to running the container command:</em>

- Open up ports on your servers firewall that match nginx.conf and docker-compose file(s) if needed
  ~~- Change `<hostname>` in nginx.conf to your hostname.
- Create a folder named `ssl` inside ./nginx folder, & generate SSL certs:
  - Open the command line and run these commands inside the ssl folder to generate a self signed certificate:

    `openssl req -new -newkey rsa:4096 -x509 -sha512 -days 365 -nodes -out nginx.crt -keyout nginx.key`

  - Generate the DH Params: With Forward Secrecy, if an attacker gets a hold of the server's private key, it will not be able to decrypt past communications. The private key is only used to sign the DH handshake, which does not reveal the pre- master key. Diffie-Hellman ensures that the pre-master keys never leave the client and the server, and cannot be intercepted by a MITM. This takes bout 3-5 min to generate:

    `openssl dhparam -out dhparam.pem 4096`

1.  Go into the root folder and run:

`docker-compose up -d --build`

2.  https is avail on:

`https://<hostname>/browser/` or
`https://localhost/browser`

 <br />
 
### Manual Guide

0. install neo4j
1. create a project
2. create a graph in the project
3. write user and password
4. change .apoc.yml accordingly
5. rename .env.example to .env
6. change clientId and clientSecret in .env

```
node install
node server.js
```

hit
` GET /api/v1/login` from the browser
and complete the process of logging into Spotify.

now check Neo4j Database with

`MATCH (n) RETURN n`

if nodes appear it means you are ready to discover the other functions...

hit `http://localhost:3000/docs/` for docs
