module.exports = {
    href:{
        type:'string',
        required:true,
        min:1,
        max:255


    },
    id:{
        type:'string',
        required:true,
        unique:true

        
    },

    name:{
        type:'string',
        required:true,
        min:1,
        max:255

    },

    popularity:{
        type:'number',
        required:true,
        min:1,
        max:255

    },

    type:{
        type:'string',
        required:true,
        min:1,
        max:255

    },
    uri:{
        type:'string',
        required:true,
        min:1,
        max:255

	}
}