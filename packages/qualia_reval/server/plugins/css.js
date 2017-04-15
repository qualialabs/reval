import Plugins from './plugins.js';

Plugins.add('CSS', {

  extensions: ['css'],
  locations: ['client'],

  compile({filePath, code}) {
    return `
      var filePath = \`${filePath}\`,
          existingCSS = document.getElementById(filePath),
          css = document.createElement("style");

      if (existingCSS) {
        existingCSS.outerHTML = "";
      }

      css.id = filePath;
      css.type = "text/css";
      css.innerHTML = \`${code}\`;
      document.body.appendChild(css);
    `;
  },

});
