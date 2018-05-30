import Plugins from './plugins.js';
import Utils from '../utils.js';

Plugins.add('ECMAScript', {

  extensions: ['js'],

  compile({ code, filePath }) {
    code = Package.ecmascript.ECMAScript.compileForShell(code);

    let moduleName = Utils.getModuleName(filePath);
    code = `var module = RevalModules.getModule('${moduleName}'); module.importSync = module.importSync || module.import; var _module = module; var require = module.require; \n\n${code}`;

    return code;
  },

});
