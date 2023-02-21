
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

### Guide

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
``` GET /api/v1/login``` from the browser
and complete the process of logging into Spotify.

now check Neo4j Database with 

``` MATCH (n) RETURN n ```

if nodes appear it means you are ready to discover the other functions...

hit ``` http://localhost:3000/docs/ ``` for docs


