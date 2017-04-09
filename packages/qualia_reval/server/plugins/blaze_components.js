import Plugins from './plugins.js';

Plugins.add('BlazeComponents', {

  extensions: ['js'],
  locations: ['client'],

  compile({code}) {
    let regex = /register\(['"](.*?)['"]\)/gi,
        templateNames = [],
        match
    ;

    while(match = regex.exec(code)) {
      templateNames.push(match[1]);
    }

    _.unique(templateNames).forEach(templateName => {
      code = `
              if (BlazeComponent.components['']['${templateName}']) {
                delete BlazeComponent.components['']['${templateName}'];
              }
              if (Template['${templateName}']) {
                Template['${templateName}'] = new Template('BlazeComponent.${templateName}', Template['${templateName}'].renderFunction);
              }
            ` + code;
    });

    return code;
  },

});
