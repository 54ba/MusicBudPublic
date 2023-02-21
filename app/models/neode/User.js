module.exports = 
{
    email:
        {
            type:'string',
            required:true,
            unique:true,
            email:true,
            min:1,
            max:255
        },
    password : 
        {
            type: 'string',
            required:true,
            min:1,
            max:255

        },
    birthDate: 
        {
        	type:'date',
            required:true,
            min:1,
            max:255

        },
    country:
        {
        	type:'string',

        },
    displayName:
        {
            type:'string',
            required:true,
            min:1,
            max:255

        },
    likesArtist:
        {
            type: "relationship",
            target: "Artist",
            relationship: "LIKESARTIST",
            direction: "out",
            eager:true
        },
    likesTrack:
        {
            type: "relationship",
            target: "Track",
            relationship: "LIKESTRACK",
            direction: "out",
            eager:true
        }
}

