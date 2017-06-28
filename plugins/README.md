## Installation of available plugins

### Spacemacs
Copy the code in spacemacs.el somewhere that Emacs will find it. If you have a
 private layer you could put it there, but just sticking it in
~/.spacemacs should work.
If your server isn't located at localhost:3000, you can modify that
reference on the `(concat ...` line.

### Sublime
Create a new plugin: Sublime -> Tools -> Developer -> New Plugin
Copy sublime.py file into the new plugin and save it as `qualia_reval.py`
Bind reloading to a key by placing something like this in your keymap:
`{ "keys": ["ctrl+r"], "command": "qualia_reval"}`.
If your server isn't located at localhost:3000, you can modify that
reference on the `url = ...` line.

### Webstorm (Intellij)
Go to File -> Settings -> Plugins -> Install from disk and select
reval.jar. You will need to restart the IDE to see changes. By default
the keymap shortcut is Ctrl + Alt + S, but you can change it on
File -> Settings -> Keymap -> Main menu -> Code -> Update Blaze Code


### Atom
Go to Edit -> [Init Script..., Keymaps...]
In init.coffee paste following (with notion that indentation is important for script):
```
http = require('http')

atom.commands.add 'atom-text-editor',
  'editor:qualia-reval': () ->
    req = http.request({
      host: 'localhost',
      port: 3000,
      path: '/reval/reload?filePath=' + atom.workspace.getActiveTextEditor().getTitle(),
      method: 'POST'
    })
    req.write(atom.workspace.getActiveTextEditor().getBuffer().getText())
    req.end() 
```
In keymap.cson paste- replacing "'alt-a'" with whatever you desire:
```
'atom-text-editor':
  'alt-a': 'editor:qualia-reval'
```
