import Plugins from './plugins.js';

Plugins.add('Publications', {

  extensions: ['js'],

  compile({ code }) {
    if (!code.includes('Meteor.publish')) {
      return code;
    }

    code = code.replace(/Meteor\.publish/g, 'revalPublish');
    return `
      let revalPublish = function(name) {
        delete Meteor.server.publish_handlers[name];
        return Meteor.publish.apply(this, arguments);
      }
      ${code}
      Object.values(Meteor.server.sessions).forEach(session => session.close());
    `;
  },

});
