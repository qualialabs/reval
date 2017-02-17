import fs from 'fs';
import path from 'path';

import {Meteor} from 'meteor/meteor';
import {Picker} from 'meteor/meteorhacks:picker';

let rootDir = path.join(process.cwd(), '..', '..', '..', '..', '..');

Picker.route('/reval/edit', function(params, request, response) {
  let filePath = params.query.filePath || '';
  if (filePath && filePath[0] !== path.sep) {
    if (filePath[0] === '~') {
      filePath = filePath.replace('~', os.homedir());
    }
    else {
      filePath = path.resolve(rootDir, filePath);
    }
  }

  let extension = filePath
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
