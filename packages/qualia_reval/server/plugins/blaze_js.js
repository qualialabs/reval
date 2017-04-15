import Plugins from './plugins.js';

Plugins.add('BlazeJS', {

  extensions: ['js'],
  locations: ['client'],

  compile({code}) {
    let regex = /Template\.([a-z0-9]*?)\./gi,
        templateNames = [],
        match
    ;

    while(match = regex.exec(code)) {
      templateNames.push(match[1]);
    }

    _.unique(templateNames).forEach(templateName => {
      code = `
              if (Template['${templateName}']) {
                Template['${templateName}'] = new Template('Template.${templateName}', Template['${templateName}'].renderFunction);
              }
            ` + code;
    });

    return code;
  },

});
