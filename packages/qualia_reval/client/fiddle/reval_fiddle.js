import { Reval } from 'meteor/qualia:reval';

Template.revalFiddle.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {
      Reval.baseElem = 'revalFiddleView';
      Reval.toggleConnection = true;

      tpl.firstFrameURL.set(tpl.templateToURL(tpl.data.templateName, 'html'));
      tpl.secondFrameURL.set(tpl.filePathToURL(tpl.data.filePath));
      tpl.thirdFrameURL.set(tpl.templateToURL(tpl.data.templateName, 'js'));

      tpl.getFiles();
    },

    firstFrameURL: new ReactiveVar(),
    secondFrameURL: new ReactiveVar(),
    thirdFrameURL: new ReactiveVar(),
    allFiles: new ReactiveVar(),

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

    async getFiles() {
      let response = await fetch('/reval/files'),
          files = JSON.parse(await response.text())
      ;
      tpl.allFiles.set(files);
    },

  }).initialize();
});


Template.revalFiddle.events({

  'mousedown resize'(event, tpl) {
    let direction = $(event.target).attr('data-direction'),
        width = $(window).width(),
        height = $(window).height(),
        $column = $(event.target).closest('column')
    ;
    $('body')
      .addClass('resize')
      .on('mousemove.resize', (event) => {
        requestAnimationFrame(() => {
          if(direction == 'vertical') {
            let percent = (event.pageY / height) * 100;
            $column
              .children('revalFiddleFrame')
                .eq(0)
                  .css('height', `${percent}vh`)
                  .end()
                .eq(1)
                  .css('height', `${100 - percent}vh`)
            ;
          }
          else if (direction == 'horizontal') {
            let percent = (event.pageX / width) * 100;
            tpl.$('revalFiddle')
              .children('column')
                .eq(0)
                  .css('width', `${percent}vw`)
                  .end()
                .eq(1)
                  .css('width', `${100 - percent}vw`)
            ;
          }
        });
        event.preventDefault();
      })
      .one('mouseup.resize', (event) => {
        $('body')
          .removeClass('resize')
          .off('.resize')
        ;
      })
    ;
  },

  'change revalAutocomplete input'(e, tpl) {
    let filePath = $(e.target).val();
    tpl.secondFrameURL.set(tpl.filePathToURL(filePath));
  },

});

Template.revalFiddle.helpers({

  $tpl() {
    return Template.instance();
  },

});
