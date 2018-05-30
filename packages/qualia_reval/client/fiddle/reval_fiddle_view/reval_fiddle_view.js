Template.revalFiddleView.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {

    },

    templateWrapper() {
      return tpl.data.templateWrapper;
    },

    templateName() {
      return tpl.data.templateName;
    },

    templateData() {
      return tpl.data.templateData
        ? JSON.parse(tpl.data.templateData)
        : {}
      ;
    },

  }).initialize();

});

Template.revalFiddleView.helpers({

  $tpl() {
    return Template.instance();
  },

});
