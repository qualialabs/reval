## Installation of available plugins

### Spacemacs
Copy the code in spacemacs.el somewhere that Emacs will find it. If you have a
 private layer you could put it there, but just sticking it in
~/.spacemacs should work.
If your server isn't located at localhost:3000, you can modify that
reference on the `(concat ...` line.

### Sublime Text
Install the `Meteor Reval` package with Sublime Text's [Package Control](https://packagecontrol.io/)
or clone https://github.com/qualialabs/reval-sublime into your local Sublime
`/Packages` directory.

### Webstorm (Intellij)
Go to File -> Settings -> Plugins -> Install from disk and select
reval.jar. You will need to restart the IDE to see changes. By default
the keymap shortcut is Ctrl + Alt + S, but you can change it on
File -> Settings -> Keymap -> Main menu -> Code -> Update Blaze Code

### Atom
Install the `atom-reval` package with Atom's package browser or from
[atom.io](https://atom.io/packages/atom-reval).
