Template.revalFiddleFrame.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {
      if (tpl.data.templateName) {
        tpl.setFrameURL(tpl.templateToURL(tpl.data.templateName, tpl.data.extension));
      }
      else if (tpl.data.filePath) {
        tpl.setFrameURL(tpl.filePathToURL(tpl.data.filePath));
      }
      else {
        tpl.validURL.set(false);
      }
    },

    validURL: new ReactiveVar(undefined),
    frameURL: new ReactiveVar(''),

    allFiles() {
      return tpl.data.allFiles.get();
    },

    searchOptions() {
      return {
        choices: tpl.allFiles(),
        placeholder: 'Search files...',
        onSelect(e, choice) {
          tpl.setFrameURL(tpl.filePathToURL(choice));
        },
      };
    },

    templateToURL(templateName, extension) {
      return templateName
        ? `/reval/edit?templateName=${templateName}&sourceType=${extension}`
        : ''
      ;
    },

    filePathToURL(filePath) {
      let extension = (filePath || '').split('.').pop();
      return filePath
        ? `/reval/edit?filePath=${filePath}&sourceType=${extension}`
        : ''
      ;
    },

    setFrameURL(url) {
      tpl.frameURL.set(url);

      tpl.validURL.set(undefined);
      fetch(tpl.frameURL.get().replace('/reval/edit', '/reval/read')).then(response => {
        if (response.ok) {
          tpl.validURL.set(true);
        }
        else {
          tpl.validURL.set(false);
        }
      });
    },

    showFrame() {
      return tpl.frameURL.get() && tpl.validURL.get() === true;
    },

    showSearch() {
      let allFiles = tpl.allFiles(),
          validURL = tpl.validURL.get()
      ;
      return allFiles && validURL === false;
    },

    getExtension() {
      let extension = tpl.data.extension || '';
      if(extension == 'js') {
        return 'client js';
      }
      if (tpl.data.filePath) {
        extension = 'server ' + tpl.data.filePath.split('.').pop();
      }
      return extension;
    },

  }).initialize();
});

Template.revalFiddleFrame.helpers({

  $tpl() {
    return Template.instance();
  },

});
