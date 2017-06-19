import fs from 'fs';
import vm from 'vm';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import Plugins from './plugins/plugins.js';
import Utils from './utils.js';
import Ngrok from './ngrok.js';

export default {

  initialize() {
    this.prepareCollection();
    this.ngrok = new Ngrok();

    return this;
  },

  hooks: {
    save: [],
  },

  prepareCollection() {
    this.revalFiles = new Mongo.Collection('reval_files');

    this.onReload();
    this.watchClientReload();

    Meteor.publish('revalFiles', () => {
      return this.revalFiles.find({});
    });
  },

  watchClientReload() {
    // Hack to get access to the autoupdate collection
    let dummy = new Mongo.Collection('reval.dummy', {connection: null}),
        ClientVersions = dummy._driver.noConnCollections['meteor_autoupdate_clientVersions']
    ;

    ClientVersions.find({_id: 'version'}).observe({
      changed: () => {
        this.onReload();
      },
    });
  },

  publish() {
    this.ngrok.start();
    this.ngrok.waitHealthy();
    return this.ngrok.getPublicURL();
  },

  onReload() {
    this.revalFiles.remove({cleared: true});

    let files = this.revalFiles.find().fetch(),
        oldFiles = [];
    files.forEach(file => {
      if (!fs.existsSync(file.path)) {
        return;
      }

      let stats = fs.statSync(file.path),
          modified = new Date(stats.mtime.getTime());

      modified.setSeconds(modified.getSeconds() + 5);
      if (modified > file.modified) {
        oldFiles.push(file.path);
        this.revalFiles.remove(file._id);
      }
    });

    if (oldFiles.length > 0) {
      console.log(`\n\x1b[32mReval\x1b[0m dropping patches:`);
      oldFiles.forEach(path => console.log(`    ${path}`));
    }

    console.log(); // Add newline
    files = this.revalFiles.find().fetch();

    if (files.length > 0) {
      console.log(`\x1b[32mReval\x1b[0m applying patches:`);
      files.forEach(file => console.log(`    ${file.path}`));
      console.log();
    }

  },

  getFile(path) {
    let revalFile = this.revalFiles.findOne({path}),
        code = ''
    ;

    if (revalFile) {
      code = revalFile.code;
    }
    else if (path && fs.existsSync(path)) {
      code = fs.readFileSync(path, 'utf8');
    }

    return code;
  },

  save(filePaths) {
    let files = this.revalFiles.find().fetch(),
        savedFiles = [];

    if (filePaths.length > 0) {
      files = files.filter(file => {
        return filePaths.includes(file.path);
      });
    }

    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.code);

        savedFiles.push(file.path);
        this.revalFiles.remove(file._id);
      }
    });

    this.hooks['save'].forEach(callback => callback(files));

    if (savedFiles.length > 0) {
      console.log(`\n\x1b[32mReval\x1b[0m saving patches:`);
      savedFiles.forEach(path => console.log(`    ${path}`));
      console.log();
    }
  },

  clear(filePaths) {
    let files = this.revalFiles.find().fetch(),
        clearedFiles = [];

    if (filePaths.length > 0) {
      files = files.filter(file => {
        return filePaths.includes(file.path);
      });
    }

    files.forEach(file => {
      clearedFiles.push(file.path);

      if (fs.existsSync(file.path)) {
        try {
          this.reval(file.path, fs.readFileSync(file.path, 'utf8'), true);
        }
        catch(e) {
          console.error(e.stack);
        }
      }

      this.revalFiles.update({ path: file.path }, {
        $set: {
          cleared: true,
        },
      });

      Meteor.setTimeout(() => {
        this.revalFiles.remove({ cleared: true, path: file.path });
      }, 5000);
    });

    if (clearedFiles.length > 0) {
      console.log(`\n\x1b[32mReval\x1b[0m dropping patches:`);
      clearedFiles.forEach(path => console.log(`    ${path}`));
      console.log();
    }
  },

  reval(filePath, code, silent=false) {
    filePath = Utils.resolvePath(filePath);

    let modified = Utils.getSafeModified(filePath);
    if (this.revalFiles.find({ path: filePath }).count() > 0) {
      this.revalFiles.update({ path: filePath }, {$set:{ code, modified }});
    }
    else {
      this.revalFiles.insert({ path: filePath, code, modified });
    }

    // Attempt to find if this file is on the client or the server, or both
    // Currently we only check this for javascript files and assume
    // everything else is bound for the client
    let extension = filePath.split('.').pop(),
        locations = {
          client: true,
          server: false,
        }
    ;
    if (extension === 'js') {
      _.extend(locations, Utils.findFile(filePath));
    }

    // Maybe run code on client
    if (locations.client) {
      let compiledCode = Plugins.compile({
        filePath,
        code,
        location: 'client',
      });
      this.evalClient(filePath, compiledCode);
    }

    // Maybe run code on server
    if (locations.server) {
      let compiledCode = Plugins.compile({
        filePath,
        code,
        location: 'server',
      });
      this.evalServer(filePath, compiledCode);
    }

    if (!silent) {
      console.log(`\x1b[32mReval\x1b[0m patching ${filePath}`);
    }
  },

  evalClient(path, code) {
    this.revalFiles.update({path}, {
      $set: {
        client: true,
        clientEval: code,
        cleared: false,
      },
    });
  },

  evalServer(path, code) {
    this.revalFiles.update({path}, {
      $set: {
        server: true,
        serverEval: code,
        cleared: false,
      }
    });
    let script = new vm.Script(code, {name: path});
    script.runInThisContext();
  },

  addHook(type, callback) {
    this.hooks[type].push(callback);
  },

}.initialize();
