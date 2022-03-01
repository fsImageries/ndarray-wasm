const fs = require('fs')
const path = require('path')

const image = path.join(__dirname, './test.jpg')
const file = fs.readFileSync(image, {encoding:'utf8'})

console.log(typeof file)