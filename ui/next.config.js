const withImages = require('next-images');
const withTranspiledModules = require('next-transpile-modules')([ '@allenai/varnish' ]);

module.exports = withImages(withTranspiledModules({
    /* Disabling NextJS v11 default static image import system in favor of plugin
       https://nextjs.org/docs/upgrading#nextconfigjs-customization-to-import-images */
    images: {
        disableStaticImages: true,
    },
    poweredByHeader: false
}));
