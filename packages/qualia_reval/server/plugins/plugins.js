export default {

  plugins: [],

  add(name, plugin) {
    _.defaults(plugin, {
      name,
      extensions: [],
      locations: ['client', 'server'],
    });

    this.plugins.unshift(plugin);
  },

  compile({filePath, code, location}) {
    let extension = filePath.split('.').pop();

    this.plugins.forEach(plugin => {
      let hasExtension = plugin.extensions.includes(extension),
          hasLocation = plugin.locations.includes(location);
      if (!hasExtension || !hasLocation) {
        return;
      }

      try {
        let newCode = plugin.compile({filePath, code, location});
        if (newCode !== undefined) {
          code = newCode
        }
      }
      catch(e) {
        console.error(e.message);
        console.error(e.stack);
        // code = `console.error(\`Can't eval invalid ${e.stack}\`)`;
        code = '';
      }

    });

    return code;
  },

};
