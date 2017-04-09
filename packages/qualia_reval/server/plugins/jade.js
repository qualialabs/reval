import Plugins from './plugins.js';
import {JadeCompiler} from 'meteor/mquandalle:jade-compiler';
import {SpacebarsCompiler} from 'meteor/spacebars-compiler';

Plugins.add('Jade', {

  extensions: ['jade'],
  locations: ['client'],

  compile({code}) {
    let result = '',
        tree = JadeCompiler.parse(code)
    ;

    tree.forEach(({attrs, children}) => {
      let templateName = attrs.name,
          compiledHTML = SpacebarsCompiler.codeGen(children);
      result += `
          if (Template['${templateName}']) {
            Template['${templateName}'].renderFunction = function() { var view=this; return ${compiledHTML}() };
        }
        `;
    });

    return result;
  },

});
