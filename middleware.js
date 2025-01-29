const { default: slugify } = require("slugify");

function makeSlug(str){
   return slugify(str, {
        replacement: '',  // replace spaces with nothing
        remove: /!@#$%^&*()+=?><;:'"|/g,
        lower: true,      // convert to lower case
        strict: false,     // strip special characters except replacement, defaults to `false`
      })
}


module.exports = makeSlug


