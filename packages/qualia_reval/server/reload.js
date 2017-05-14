import {Meteor} from 'meteor/meteor';
import {Picker} from 'meteor/meteorhacks:picker';

import Reval from './reval.js';
import Utils from './utils.js';

Picker.route('/reval/reload', function(params, request, response) {
  let code = Utils.getData(request),
      filePath = Utils.normalizePath(params.query.filePath)
  ;

  Reval.reval(filePath, code);

  response.statusCode = 200;
  response.end();
});

Picker.route('/reval/save', function(params, request, response) {
  let data = Utils.getData(request) || '[]',
      filePaths = JSON
      .parse(data)
      .map(path => Utils.normalizePath(path))
  ;

  Reval.save(filePaths);

  response.statusCode = 200;
  response.end();
});

Picker.route('/reval/clear', function(params, request, response) {
  let data = Utils.getData(request) || '[]',
      filePaths = JSON
        .parse(data)
        .map(path => Utils.normalizePath(path))
  ;

  Reval.clear(filePaths);

  response.statusCode = 200;
  response.end();
});

Picker.route('/reval/publish', function(params, request, response) {
  response.statusCode = 200;
  response.end(Reval.publish());
});
