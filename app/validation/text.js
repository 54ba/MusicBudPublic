const { query,param } = require('express-validator');

const paramsValidation = 
[
    param('textSlug')
    .notEmpty()
    .escape(),
    
];


const indexValidation = 
[
    query('page')
    .optional({nullable: true})
    .isNumeric(),
    query('size')
    .optional({nullable: true})
    .isNumeric()
];

const searchValidation =
[
    query('title')
    .optional({nullable: true})
    .isString()
    .escape(),
    query('text')
    .optional({nullable: true})
    .isString()
    .escape(),
    query('level')
    .optional({nullable: true})
    .isInt()
    .escape(),
    query('audience')
    .optional({nullable: true})
    .isString()
    .escape(),
    query('categories')
    .optional({nullable: true})
    .isArray()
    .escape(),
    query('tags')
    .optional({nullable: true})
    .isArray()
    .escape(),
    query('levels')
    .optional({nullable: true})
    .isArray()
    .escape(),
    query('genders')
    .optional({nullable: true})
    .isArray()
    .escape(),
    query('styles')
    .optional({nullable: true})
    .isArray()
    .escape(),
    
];


module.exports = 
{
  
    paramsValidation,
    indexValidation,
    searchValidation
   
}