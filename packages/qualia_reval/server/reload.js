import {Meteor} from 'meteor/meteor';
import {Picker} from 'meteor/meteorhacks:picker';

let callbacks = {};
Picker.route('/reval/reload', function(params, request, response) {
    let filePath = params.query.filePath,
        code = '',
        payload = '',
        extension = filePath.split('.').pop()
    ;

    Meteor.wrapAsync(done => {
      request.on('data', function(data) {
        code += data;
      });
      request.on('end', function() {
        done(null, '');
      });
    })();

    try {
      if (extension === 'js') {
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

        payload = Package.ecmascript.ECMAScript.compileForShell(code);
      }
      else if (extension === 'html') {
        let regex = /<\s*template\s+name\s*=\s*['"](.*?)['"]\s*>([^]*?)<\s*\/\s*template\s*>/gmi,
            match
        ;

        while (match = regex.exec(code)) {
          let templateName = match[1],
              html = match[2],
              compiledHTML = SpacebarsCompiler.compile(html)
          ;

          payload += `
            if (Template['${templateName}']) {
              Template['${templateName}'].renderFunction = function() { var view=this; return ${compiledHTML}() };
          }
          `;
        }
      }
      else if (extension === 'css') {
        payload = `
          var css = document.createElement("style");
          css.type = "text/css";
          css.innerHTML = \`${code}\`;
          document.body.appendChild(css);
        `;
      }
    }
    catch(e) {
      console.error(e.message);
      console.error(e.stack);
      if (!params.query.mute) {
        payload = `console.error(\`Can't eval invalid ${e.stack}\`)`;
      }
    }

    if (payload) {
      _.each(callbacks, callback => {
        callback(payload);
      });
    }

    response.statusCode = 200;
    response.end();
});

Meteor.publish('reval', function() {
  let _id = Random.id();

  this.added('reval', _id, {payload: ''});
  callbacks[_id] = payload => {
    this.changed('reval', _id, {payload});
  };
  this.onStop(() => {
    delete callbacks[_id];
  });

  this.ready();
});
