import Plugins from './plugins.js';
import Utils from '../utils.js';

Plugins.add('ECMAScript', {

  extensions: ['js'],

  compile({ code, filePath }) {
    code = Package.ecmascript.ECMAScript.compileForShell(code);

    let moduleName = Utils.getModuleName(filePath);
    code = `var module = RevalModules.getModule('${moduleName}'); var _module = module; \n\n${code}`;

    return code;
  },

});
