import Plugins from './plugins.js';

Plugins.add('Methods', {

  extensions: ['js'],

  compile({ code }) {
    if (!code.includes('Meteor.methods')) {
      return code;
    }

    code = code.replace(/Meteor\.methods/g, 'revalMethods');
    return `
      let revalMethods = function(methods) {
        _.each(methods, (handler, name) => {
          if (Meteor.isClient) {
            Meteor.connection._methodHandlers[name] = handler;
          }
          else if (Meteor.isServer) {
            Meteor.server.method_handlers[name] = handler;
          }
        });
      }
    ` + code;
  },

});
