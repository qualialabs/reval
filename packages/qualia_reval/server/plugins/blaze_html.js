import Plugins from './plugins.js';
import {SpacebarsCompiler} from 'meteor/spacebars-compiler';

Plugins.add('BlazeHTML', {

  extensions: ['html'],
  locations: ['client'],

  compile({code}) {
    let result = '',
        regex = /<\s*template\s+name\s*=\s*['"](.*?)['"]\s*>([^]*?)<\s*\/\s*template\s*>/gmi,
        match
    ;

    while (match = regex.exec(code)) {
      let templateName = match[1],
          html = match[2],
          compiledHTML
      ;

      try {
        compiledHTML = SpacebarsCompiler.compile(html);
      }
      catch(e) {
        let errorMessage = `Encountered an error while compiling ${templateName}: ${e.message}\n${e.stack}`;
        console.error(errorMessage);
        // return `console.error(\`${errorMessage}\`)`;
        return '';
      }

      result += `
          if (Template['${templateName}']) {
            Template['${templateName}'].renderFunction = function() { var view=this; return ${compiledHTML}() };
        }
        `;
    }

    return result;
  },

});
