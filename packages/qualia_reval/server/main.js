import fs from 'fs';
import {Meteor} from 'meteor/meteor';
import {Picker} from 'meteor/meteorhacks:picker';

let callbacks = {};

Picker.route('/reval/edit', function(params, request, response) {
  let filePath = params.query.filePath,
      extension = filePath
        ? filePath.split('.').pop()
        : 'js',
      mode = {
        js: 'javascript',
        html: 'handlebars',
        css: 'css',
      }[extension],
      code = ''
  ;

  if (filePath) {
    code = fs.readFileSync(filePath, 'utf8');
  }

  response.writeHead(200, {'Content-Type': 'text/html'})
  response.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <title>Reval Test Editor</title>
    <style type="text/css" media="screen">
        #editor {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
    </style>
    </head>
    <body>

    <textarea>${code}</textarea>
    <div id="editor"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.6/ace.js" type="text/javascript" charset="utf-8"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.js" type="text/javascript" charset="utf-8"></script>
    <script>
      var filePath = \`${filePath}\`;
      var text = $('textarea').text();
      $('textarea').remove();

      var el = document.getElementById("editor");
      var editor = ace.edit(el)
      editor.session.setValue(text)
      editor.getSession().setMode("ace/mode/${mode}");
      editor.setTheme("ace/theme/monokai");
      editor.commands.addCommand({
          name: 'reload',
          bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
          exec: function(editor) {
            var code = editor.session.getValue();
            $.ajax({
              type: "POST",
              url: '/reval/reload?filePath=' + filePath,
              data: code,
            });
          }
      });
      editor.commands.addCommand({
          name: 'save',
          bindKey: {win: "Ctrl-Shift-S", "mac": "Cmd-Shift-S"},
          exec: function(editor) {
            var code = editor.session.getValue();
            $.ajax({
              type: "POST",
              url: '/reval/save?filePath=' + filePath,
              data: code,
            });
          }
      })
    </script>

    </script>
    </body>
    </html>
  `);
});

Picker.route('/reval/save', function(params, request, response) {
  let filePath = params.query.filePath,
      code = ''
  ;

  Meteor.wrapAsync(done => {
    request.on('data', function(data) {
      code += data;
    });
    request.on('end', function() {
      done(null, '');
    });
  })();

  fs.writeFileSync(filePath, code);
});

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
