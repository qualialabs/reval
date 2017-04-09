# qualia:reval - Instant Meteor reloads

This package allows you to instantly reload files in the browser. It works with Blaze, Jade, CSS, and arbitrary Javascript, both client-side and server-side.

This is a dev-only package so you don't have to worry about it being deployed to prod.

## Installing

`meteor add qualia:reval`

## Getting Started

Open up your app, put your mouse over any template on the page and type `w` to open up the HTML/Jade and type `e` to open the Javascript. This will open the in-browser editor. Any changes you make in the editor will instantly show up on the page, but won't be persisted to disk until you click the green `Save` button for that patch. There is an optional save-as-you-type mode that can be disabled by clicking the green `Reloading Live` button. To leave Reval mode, click on your app and type `Ctrl+i` (this same keybinding can also take you back to Reval mode). 

This mode is primarily for testing `qualia:reval`, although you could use it for development if you want. A better way of using `qualia:reval` is via an editor plugin. Currently there are plugins for Sublime Text and Spacemacs (see the `plugins/` folder), but it is extremely simple to write new plugins; just `POST` the text of the file you want to reload to `localhost:3000/reval/reload?filePath=/path/to/some/file.html|js|css`.
