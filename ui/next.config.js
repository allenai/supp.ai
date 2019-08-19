const withImages = require('next-images');
const withTranspiledModules = require('next-transpile-modules');

module.exports = withImages(withTranspiledModules({
    transpileModules: [ '@allenai/varnish' ],
    poweredByHeader: false
}));
