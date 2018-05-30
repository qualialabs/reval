import { autoComplete } from './auto-complete.js';

Template.revalAutocomplete.onCreated(function() {
  let tpl = this;

  _.extend(tpl, {

    initialize() {

    },

    render() {
      tpl.input = new autoComplete({
        domRoot: tpl.getDOMRoot(),
        selector: tpl.$('input')[0],
        minChars: 1,
        source: tpl.source,
        onSelect: tpl.data.onSelect,
      });
    },

    source(term, suggest) {
      term = term.toLowerCase();

      let choices = tpl.choices(),
          suggestions = []
      ;

      choices.forEach(choice => {
        if (choice.toLowerCase().includes(term)) {
          suggestions.push(choice);
        }
      });

      suggest(suggestions);
    },

    getDOMRoot() {
      return tpl.$('input').closest(document.body).length > 0
        ? document.body
        : document.head
      ;
    },

    choices() {
      return tpl.data.choices || [];
    },

    placeholder() {
      return tpl.data.placeholder || '';
    },

  }).initialize();

});

Template.revalAutocomplete.onRendered(function() {
  let tpl = this;
  tpl.render();
});

Template.revalAutocomplete.helpers({

  $tpl() {
    return Template.instance();
  },

});
