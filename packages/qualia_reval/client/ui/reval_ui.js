import {ReactiveVar} from 'meteor/reactive-var';

Template.revalUI.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {
      tpl.editorMode = new ReactiveVar(false);
      tpl.editorURL = new ReactiveVar('');
      tpl.editorLive = new ReactiveVar(tpl.lookupEditorLive());
      tpl.inspectMode = new ReactiveVar(false);
      tpl.revalFilePath = new ReactiveVar('');

      tpl.hoverTemplate = new ReactiveVar('');
      tpl.windowWidth = new ReactiveVar($(window).width());
    },

    getOS() {
      let os = 'Unknown OS',
          version = navigator.appVersion
      ;
      if (version.indexOf('Win') !== -1) {
        os = 'pc';
      }
      if (version.indexOf('Mac') !== -1) {
        os = 'mac';
      }
      if (version.indexOf('X11') !== -1) {
        os = 'linux';
      }
      if (version.indexOf('Linux') !== -1) {
        os = 'linux';
      }
      return os;
    },

    bindEvents() {
      $('toggleReval').on('click.reval', e => {
        tpl.editorMode.set(!tpl.editorMode.get());
      });

      $(document).on('mousemove.reval', e => {
        tpl.mouseX = e.clientX;
        tpl.mouseY = e.clientY;

        if (tpl.editorMode.get()) {
          tpl.updateHoverTemplate();
        }

        let stillInspecting = tpl.getOS() === 'mac' ? e.metaKey : e.ctrlKey;
        if (tpl.inspectMode.get() && !stillInspecting) {
          tpl.inspectMode.set(false);
        }
      });

      $(window).on('resize', e => {
        tpl.windowWidth.set($(window).width());
      });

      $(document.body).on('keydown.reval', e => {
        let keys = {
              command: 91,
              ctrl: 17
            },
            specialKey = (tpl.getOS() === 'mac') ? keys.command : keys.ctrl
        ;
        if (e.keyCode === specialKey) {
          tpl.inspectMode.set(true);
        }
      });

      $(document.body).on('keypress.reval', e => {
        if (tpl.inspectMode.get() && document.activeElement === document.body && e.keyCode === 105) {
          tpl.editorMode.set(!tpl.editorMode.get());
          return false;
        }
      });

      $(document.body).on('keyup.reval', e => {
        let keys = {
              command: 91,
              ctrl: 17
            },
            specialKey = (tpl.getOS() === 'mac') ? keys.command : keys.ctrl
        ;
        if (e.keyCode === specialKey) {
          tpl.inspectMode.set(false);
        }
      });

      $(document).on('click.reval', e => {
        if (tpl.inspectMode.get()) {
          tpl.loadTemplate(tpl.updateHoverTemplate());

          e.preventDefault();
          return false;
        }
      });

      tpl.$('iframe').on('load', function() {
        let codeEditor = tpl.$('revalUI iframe')[0].contentWindow;

        tpl.inspectMode.set(false);
        if (codeEditor.revalFilePath) {
          tpl.revalFilePath.set(codeEditor.revalFilePath);
        }
      });
    },

    unbindEvents() {
      $(document.body).off('.reval');
    },

    setEditorURL(url) {
      tpl.editorURL.set(url);
      Tracker.afterFlush(() => {
        let codeEditor = tpl.$('revalUI iframe')[0].contentWindow;
        codeEditor.location.replace(url);
      });
    },

    getFileName() {
      return tpl.truncatePath(tpl.revalFilePath.get());
    },

    updateHoverTemplate() {
      let elem = document.elementFromPoint(tpl.mouseX, tpl.mouseY),
          view = Blaze.getView(elem),
          template = Reval.getTemplate(view)
      ;

      tpl.hoverTemplate.set(`Template.${template}`);
      return template;
    },

    loadTemplate(templateName) {
      let editURL = Reval.getEditURL({
        templateName,
        sourceType: 'html',
      });
      tpl.editorMode.set(true);
      tpl.setEditorURL(editURL);
    },

    lookupEditorLive() {
      return localStorage.getItem('Reval.Live') !== 'false';
    },

    getTemplates() {
      return Object
        .keys(Template)
        .filter(prop => {
          return _.isString(prop)
            && !prop.startsWith('_')
            && Template[prop] instanceof Blaze.Template
          ;
        })
      ;
    },

    getPatches() {
      return Reval.revalFiles.find({cleared: false}).fetch();
    },

    truncatePath(path='', depth=1) {
      let parts = path.split('/'),
          prefix = depth > 1 ? '../' : ''
      ;
      if (parts.length <= depth) {
        return path;
      }

      return prefix + parts.slice(-depth).join('/');
    },

    maybeHide() {
      return tpl.editorMode.get() ? 'block' : 'none';
    },

    maybeHideCode() {
      return tpl.inspectMode.get() || !tpl.editorURL.get()
        ? 'display: none'
        : ''
      ;
    },

    getMessage() {
      let modifierKey = tpl.getOS() === 'mac' ? 'Cmd' : 'Ctrl';
      return `${modifierKey} to inspect\n${modifierKey}+click to edit\n${modifierKey}+i to toggle`;
    },

    bodyCSS() {
      let css = '',
          editorWidth = 700,
          scale = Math.max(100 * (1 -  (editorWidth / tpl.windowWidth.get())), 40)
      ;

      if (tpl.editorMode.get()) {
        css = `
          html {
            overflow: hidden !important;
            background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(34, 117, 79, 0.5)) !important;
          }

          head {
            display: block !important;
          }

          body {
            position: absolute !important;
            left: 0px !important;
            right: 0px !important;
            top: 0px !important;
            bottom: 0px !important;
            height: 100% !important;

            transform        : scale(${scale/100}) !important;
            transform-origin : 100% 0% !important;
            transition       : transform .2s ease !important;
          }

        `;
      }
      else {
        css = `
          revalUI {
            display: none;
          }

          body {
            transform-origin : 100% 0% !important;
            transition       : transform .2s ease !important;
          }
        `;
      }

      css += `
        revalUI revalCode {
          width: ${100 - scale}%;
        }

        revalUI editorPlaceholder {
          width: ${100 - scale}%;
        }

        revalUI revalPanel {
          width: ${scale}%;
          height: ${100 - scale}%;
        }
      `;

      return css;
    },

    insertToggle() {
      $(`
  <toggleReval>
    <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDUyMi40NjggNTIyLjQ2OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTIyLjQ2OCA1MjIuNDY5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTMyNS43NjIsNzAuNTEzbC0xNy43MDYtNC44NTRjLTIuMjc5LTAuNzYtNC41MjQtMC41MjEtNi43MDcsMC43MTVjLTIuMTksMS4yMzctMy42NjksMy4wOTQtNC40MjksNS41NjhMMTkwLjQyNiw0NDAuNTMgICAgYy0wLjc2LDIuNDc1LTAuNTIyLDQuODA5LDAuNzE1LDYuOTk1YzEuMjM3LDIuMTksMy4wOSwzLjY2NSw1LjU2OCw0LjQyNWwxNy43MDEsNC44NTZjMi4yODQsMC43NjYsNC41MjEsMC41MjYsNi43MS0wLjcxMiAgICBjMi4xOS0xLjI0MywzLjY2Ni0zLjA5NCw0LjQyNS01LjU2NEwzMzIuMDQyLDgxLjkzNmMwLjc1OS0yLjQ3NCwwLjUyMy00LjgwOC0wLjcxNi02Ljk5OSAgICBDMzMwLjA4OCw3Mi43NDcsMzI4LjIzNyw3MS4yNzIsMzI1Ljc2Miw3MC41MTN6IiBmaWxsPSIjMDAwMDAwIi8+CgkJPHBhdGggZD0iTTE2Ni4xNjcsMTQyLjQ2NWMwLTIuNDc0LTAuOTUzLTQuNjY1LTIuODU2LTYuNTY3bC0xNC4yNzctMTQuMjc2Yy0xLjkwMy0xLjkwMy00LjA5My0yLjg1Ny02LjU2Ny0yLjg1NyAgICBzLTQuNjY1LDAuOTU1LTYuNTY3LDIuODU3TDIuODU2LDI1NC42NjZDMC45NSwyNTYuNTY5LDAsMjU4Ljc1OSwwLDI2MS4yMzNjMCwyLjQ3NCwwLjk1Myw0LjY2NCwyLjg1Niw2LjU2NmwxMzMuMDQzLDEzMy4wNDQgICAgYzEuOTAyLDEuOTA2LDQuMDg5LDIuODU0LDYuNTY3LDIuODU0czQuNjY1LTAuOTUxLDYuNTY3LTIuODU0bDE0LjI3Ny0xNC4yNjhjMS45MDMtMS45MDIsMi44NTYtNC4wOTMsMi44NTYtNi41NyAgICBjMC0yLjQ3MS0wLjk1My00LjY2MS0yLjg1Ni02LjU2M0w1MS4xMDcsMjYxLjIzM2wxMTIuMjA0LTExMi4yMDFDMTY1LjIxNywxNDcuMTMsMTY2LjE2NywxNDQuOTM5LDE2Ni4xNjcsMTQyLjQ2NXoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNNTE5LjYxNCwyNTQuNjYzTDM4Ni41NjcsMTIxLjYxOWMtMS45MDItMS45MDItNC4wOTMtMi44NTctNi41NjMtMi44NTdjLTIuNDc4LDAtNC42NjEsMC45NTUtNi41NywyLjg1N2wtMTQuMjcxLDE0LjI3NSAgICBjLTEuOTAyLDEuOTAzLTIuODUxLDQuMDktMi44NTEsNi41NjdzMC45NDgsNC42NjUsMi44NTEsNi41NjdsMTEyLjIwNiwxMTIuMjA0TDM1OS4xNjMsMzczLjQ0MiAgICBjLTEuOTAyLDEuOTAyLTIuODUxLDQuMDkzLTIuODUxLDYuNTYzYzAsMi40NzgsMC45NDgsNC42NjgsMi44NTEsNi41N2wxNC4yNzEsMTQuMjY4YzEuOTA5LDEuOTA2LDQuMDkzLDIuODU0LDYuNTcsMi44NTQgICAgYzIuNDcxLDAsNC42NjEtMC45NTEsNi41NjMtMi44NTRMNTE5LjYxNCwyNjcuOGMxLjkwMy0xLjkwMiwyLjg1NC00LjA5NiwyLjg1NC02LjU3ICAgIEM1MjIuNDY4LDI1OC43NTUsNTIxLjUxNywyNTYuNTY1LDUxOS42MTQsMjU0LjY2M3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />
  </toggleReval>
      `).appendTo('body');
    },

  }).initialize();

});

Template.revalUI.onRendered(function() {
  let tpl = this;
  tpl.insertToggle();
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

  'click codeTab'(e, tpl) {
    let extension = $(e.target).attr('data-extension'),
        filePath = tpl.revalFilePath.get(),
        newFilePath = filePath.split('.').slice(0, -1).join('.') + '.' + extension
    ;
    tpl.setEditorURL(Reval.getEditURL({filePath: newFilePath}));
  },

  'click revalPublish'() {
    let newTab = window.open('', '_blank');
    Reval
      .publish()
      .then(url => {
        newTab.location = url;
      })
    ;
  },

  'input revalPanelSearch input, change revalPanelSearch input'(e, tpl) {
    let templates = tpl.getTemplates(),
        inputValue = e.target.value
    ;

    templates.forEach(template => {
      if (template !== inputValue) {
        return;
      }

      let editURL = Reval.getEditURL({
        templateName: inputValue,
        sourceType: 'html',
      });

      tpl.setEditorURL(editURL);

      e.target.value = '';
    });
  },

  'click tr'(e, tpl) {
    let index = $(e.target).closest('tr').attr('data-index'),
        patch = tpl.getPatches()[index],
        url = Reval.getEditURL({ filePath: patch.path })
    ;
    tpl.setEditorURL(url);
  },

  'click savePatch'(e, tpl) {
    e.preventDefault();

    let index = $(e.target).closest('tr').attr('data-index'),
        patch = tpl.getPatches()[index]
    ;
    Reval.save([patch.path]);
  },

  'click revalSaveAll'(e, tpl) {
    e.preventDefault();

    let patches = tpl.getPatches().map((patch) => patch.path);
    Reval.save(patches);
  },

  'click revalClearAll'(e, tpl) {
    e.preventDefault();
    let patches = tpl.getPatches(),
        paths = []
    ;
    paths = patches.map((patch) => patch.path);
    Reval.clear(paths);
  },

  'click clearPatch'(e, tpl) {
    e.preventDefault();

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
