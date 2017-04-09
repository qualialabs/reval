Template.revalUI.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {
      tpl.editorMode = new ReactiveVar(false);
      tpl.editorURL = new ReactiveVar('');
      tpl.editorLive = new ReactiveVar(tpl.lookupEditorLive());

      tpl.hoverTemplate = new ReactiveVar('');
    },

    bindEvents() {
      $(document).on('mousemove.reval', e => {
        tpl.mouseX = e.clientX;
        tpl.mouseY = e.clientY;

        if (tpl.editorMode.get()) {
          tpl.updateHoverTemplate();
        }
      });

      $(document.body).on('keypress.reval', e => {
        if (document.activeElement === document.body) {
          tpl.handleKeyPress(e);
          return false;
        }
      });

      // tpl.$('iframe').on('load', function() {
      //   let codeEditor = tpl.$('revalUI iframe')[0].contentWindow;
      //   if (codeEditor.bindKeyDown) {
      //     codeEditor.bindKeyDown(function(e) {
      //       if (!tpl.$('iframe:hover')[0]) {
      //         tpl.handleKeyPress(e);
      //       }
      //     });
      //   }
      // });
    },

    unbindEvents() {
      $(document.body).off('mousemove.reval');
      $(document.body).off('keypress.reval');
    },

    setEditorURL(url) {
      let codeEditor = tpl.$('revalUI iframe')[0].contentWindow;
      codeEditor.location.replace(url);

      tpl.editorURL.set(url);
    },

    handleKeyPress(e) {
      let validKeys = [9, 101, 119]
      if (!validKeys.includes(e.keyCode)) {
        return;
      }

      if (e.ctrlKey && e.keyCode === 9) {
        tpl.editorMode.set(!tpl.editorMode.get());
      }
      else if (e.keyCode === 101 || e.keyCode === 119) {
        let editURL = Reval.getEditURL({
          templateName: tpl.updateHoverTemplate(),
          sourceType: e.keyCode === 101 ? 'js' : 'html'
        });

        tpl.editorMode.set(true);
        tpl.setEditorURL(editURL);
      }
    },

    updateHoverTemplate() {
      let elem = document.elementFromPoint(tpl.mouseX, tpl.mouseY),
          view = Blaze.getView(elem),
          template = Reval.getTemplate(view)
      ;

      tpl.hoverTemplate.set(template);
      return template;
    },

    lookupEditorLive() {
      return localStorage.getItem('Reval.Live') !== 'false';
    },

    getPatches() {
      return Reval.revalFiles.find({cleared: false}).fetch();
    },

    maybeHide() {
      return tpl.editorMode.get() ? 'block' : 'none';
    },

    bodyCSS() {
      if (tpl.editorMode.get()) {
        return `
          html {
            overflow: hidden;
          }

          head {
            display: block;
          }

          body {
            position: absolute;
            left: 0px;
            right: 0px;
            top: 0px;
            bottom: 0px;

            transform        : scale(.5);
            transform-origin : 100% 0%;
            transition       : transform .2s ease;
          }

        `;
      }
      else {
        return `
          revalUI {
            display: none;
          }

          body {
            transform-origin : 100% 0%;
            transition       : transform .2s ease;
          }
        `;
      }
    },

  }).initialize();

});

Template.revalUI.onRendered(function() {
  let tpl = this;
  tpl.bindEvents();
});

Template.revalUI.onDestroyed(function() {
  let tpl = this;
  tpl.unbindEvents();
});

Template.revalUI.events({

  'click toggleLive'(e, tpl) {
    localStorage.setItem('Reval.Live', !tpl.lookupEditorLive());
    tpl.editorLive.set(tpl.lookupEditorLive());
  },

  'click savePatch'(e, tpl) {
    let index = $(e.target).closest('tr').attr('data-index'),
        patch = tpl.getPatches()[index]
    ;
    Reval.save([patch.path]);
  },

  'click editPatch'(e, tpl) {
    let index = $(e.target).closest('tr').attr('data-index'),
        patch = tpl.getPatches()[index],
        url = Reval.getEditURL({ filePath: patch.path })
    ;
    tpl.setEditorURL(url)
  },

  'click clearPatch'(e, tpl) {
    let index = $(e.target).closest('tr').attr('data-index'),
        patch = tpl.getPatches()[index]
    ;
    Reval.clear([patch.path]);
  },

});

Template.revalUI.helpers({

  $tpl() {
    return Template.instance();
  },

});
