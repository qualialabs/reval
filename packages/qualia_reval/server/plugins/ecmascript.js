import Plugins from './plugins.js';

Plugins.add('ECMAScript', {

  extensions: ['js'],

  compile({code}) {
    return Package.ecmascript.ECMAScript.compileForShell(code);
  },

});
