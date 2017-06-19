import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Blaze} from 'meteor/blaze';
import {ReactiveVar} from 'meteor/reactive-var';

import {reloadPage} from './blaze.js';

Reval = {

  initialize() {
    this.revalFiles = new Mongo.Collection('reval_files');
    Meteor.subscribe('revalFiles');

    this.reloadPage = _.throttle(reloadPage, 1000);

    this.watchCode();
    this.renderUI();

    return this;
  },

  editURL: new ReactiveVar(''),

  renderUI() {
    Meteor.startup(() => {
      let view = Blaze.render(Template.revalUI, $('head')[0]);
      window.theView = view;
    });
  },

  getFiles() {
    return this.revalFiles.find({cleared: false}).fetch();
  },

  save(files=[]) {
    $.post('/reval/save', JSON.stringify(files));
  },

  clear(files=[]) {
    $.post('/reval/clear', JSON.stringify(files));
  },

  publish() {
    return new Promise(resolve => {
      $.get('/reval/publish', url => resolve(url));
    });
  },

  watchCode() {
    let reload = revalFile => {
      if (revalFile.client) {
        try {
          eval(revalFile.clientEval);
        }
        catch(e) {
          console.error(e);
        }

        let baseElem = revalFile.path.includes('qualia_reval')
            ? 'html'
            : 'body'
        ;
        this.reloadPage(baseElem);
      }
    };

    Meteor.startup(() => {
      let cursor = this.revalFiles.find({client: true}, {
        fields: {
          path: 1,
          client: 1,
          clientEval: 1,
        },
      });
      cursor.observe({added: reload, changed: reload});
    });
  },

  getEditURL({templateName, sourceType, filePath}) {
    if (filePath) {
      sourceType = filePath.split('.').pop();
      return `/reval/edit?filePath=${filePath}&sourceType=${sourceType}`;
    }
    else {
      return `/reval/edit?templateName=${templateName}&sourceType=${sourceType}`;
    }
  },

  getTemplate(view) {
    while (view && !(view.name.startsWith('Template.') || view.name.startsWith('BlazeComponent.'))) {
      view = view.parentView;
    }

    return view
      ? view.name.split('.')[1]
      : ''
    ;
  },

  editData(view) {
    let theWith = view.name === 'with'
        ? view
      : Blaze.getView(view, 'with'),
        newData = {}
    ;

    window.RevalData = _.extend(newData, theWith.dataVar.curValue);
    console.log(newData);

    let intervalID = Meteor.setInterval(() => {
      if (view.isDestroyed) {
        Meteor.clearInterval(intervalID);
      }

      _.extend(theWith.dataVar.curValue, newData);
      theWith.dataVar.dep.changed();
    }, 200);
  },

}.initialize();

export default Reval;
