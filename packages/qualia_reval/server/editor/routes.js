import {Meteor} from 'meteor/meteor';
import {Blaze} from 'meteor/blaze';
import {Picker} from 'meteor/meteorhacks:picker';

import Editor from './editor.js';
import Utils from '../utils.js';
import Reval from '../reval.js';

let cdnURL = 'https://unpkg.com/monaco-editor@0.8.3/min';

Picker.route('/reval/edit', function(params, request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'})

  try {
    let filePath = params.query.filePath || Utils.findFilePath(params.query.templateName, params.query.sourceType);
    filePath = Utils.normalizePath(filePath);

    response.end(Blaze.toHTMLWithData(Editor, {
      cdnURL: cdnURL,
      filePath,
      code: Reval.getFile(filePath),
    }));
  }
  catch(e) {
    console.log(request);
    response.end(`Unable to resolve ${request.originalUrl} to a source file.`);
  }
});

Picker.route('/reval/worker-proxy.js', function(params, request, response) {
  response.writeHead(200, {'Content-Type': 'text/javascript'})
  response.end(`
    self.MonacoEnvironment = {
        baseUrl: '${cdnURL}/'
    };
    importScripts('${cdnURL}/vs/base/worker/workerMain.js');
  `);
});
