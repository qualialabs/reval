let RevalModules = {

  initialize() {
    global.RevalModules = this;

    return this;
  },

  getModule(name) {
    return this.getModules()[name];
  },

  getModules() {
    if (!this.modules) {
      this.collectModules();
    }

    return this.modules;
  },

  collectModules() {
    let rootModule = module;
    while (rootModule.parent) {
      rootModule = rootModule.parent;
    }

    this.modules = {};
    this._collectModules(rootModule, this.modules);
  },

  _collectModules(currentModule, modules) {
    if (modules[currentModule.id]) {
      return;
    }
    modules[currentModule.id] = currentModule;

    currentModule.children.forEach(m => {
      this._collectModules(m, modules);
    });
  }

}.initialize();

export { RevalModules };
