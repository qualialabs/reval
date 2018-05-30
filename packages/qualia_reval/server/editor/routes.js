import {Meteor} from 'meteor/meteor';
import {Blaze} from 'meteor/blaze';
import {Picker} from 'meteor/meteorhacks:picker';

import Editor from './editor.js';
import Utils from '../utils.js';
import Reval from '../reval.js';

let cdnURL = 'https://unpkg.com/monaco-editor@0.11.1/min';

Picker.route('/reval/edit', function(params, request, response) {

  try {
    let filePath = params.query.filePath || Utils.findFilePath(params.query.templateName, params.query.sourceType);
    filePath = Utils.resolvePath(Utils.normalizePath(filePath));

    let code = Reval.getFile(filePath);
    if (!code) {
      throw new Meteor.Error(`Unable to find ${filePath}`);
    }

    let editorHTML = Blaze.toHTMLWithData(Editor, {
      cdnURL: cdnURL,
      filePath,
      code,
    });

    response.writeHead(200, {'Content-Type': 'text/html'})
    response.end(editorHTML);
  }
  catch(e) {
    console.log(request);
    response.writeHead(500, {'Content-Type': 'text/html'})
    response.end(`Unable to resolve ${request.originalUrl} to a source file.`);
  }
});

Picker.route('/reval/read', function(params, request, response) {

  try {
    let filePath = params.query.filePath || Utils.findFilePath(params.query.templateName, params.query.sourceType);
    filePath = Utils.resolvePath(Utils.normalizePath(filePath));

    let code = Reval.getFile(filePath);
    if (!code) {
      throw new Meteor.Error(`Unable to find ${filePath}`);
    }

    let fileInfo = JSON.stringify({ filePath, code });
    response.writeHead(200, {'Content-Type': 'text/html'})
    response.end(fileInfo);
  }
  catch(e) {
    console.log(e.stack);
    // console.log(request);
    response.writeHead(500, {'Content-Type': 'text/html'})
    response.end(`Unable to resolve ${request.originalUrl} to a source file.`);
  }
});

Picker.route('/reval/files', function(params, request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'})

  try {
    response.end(JSON.stringify(Utils.findAllFiles()));
  }
  catch(e) {
    console.log(request);
    response.end(`Failed to retrieve files.`);
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
