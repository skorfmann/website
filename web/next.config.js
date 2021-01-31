// next.config.js
const withHeroicons = require('next-transpile-modules')(['heroicons']);

module.exports = {
  ...withHeroicons(),
  target: 'serverless'
}