Package.describe({
  name: 'qualia:reval',
  version: '1.1.1',
  summary: 'Instant Meteor reloads',
  git: 'https://github.com/qualialabs/reval',
  documentation: 'README.md',
  debugOnly: true,
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.4');

  api.use([
    'ecmascript',
    'underscore',
    'tracker',
    'mongo',
    'minimongo',
    'spacebars-compiler',
    'templating',
    'blaze',
    'random',
    'autoupdate',
    'meteorhacks:picker@1.0.3',
  ], ['client', 'server']);

  api.addAssets([
    'assets/blue-polygons.jpg',
  ], ['client', 'server']);

  api.addAssets([
    'server/editor/editor.html',
    'assets/ngrok_darwin',
    'assets/ngrok_linux',
  ], 'server');

  api.mainModule('client/main.js', 'client');
  api.mainModule('server/main.js', 'server');
});
