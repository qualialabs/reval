# qualia:reval - Instant Meteor reloads

This package allows you to instantly reload files in the browser. We've only tested that Blaze HTML/JS/CSS files work well, but any code that can be reloaded by being evaling on the client should work. At some point in the future, support for (a) server side reloading and (b) a wider variety of file types will be added.

This is a dev-only package so you don't have to worry about it being deployed to prod.

## Installing

`meteor add qualia:reval`

## Getting Started

Visit `localhost:3000/reval/edit?filePath=/path/to/some/file.html|js|css`. This will load the file into Ace (an in-browser code editor). Typing `CMD+s` will reload the file in your browser and `CMD+S` will save your changes to disk.

This mode is primarily for testing `qualia:reval`, although you could use it for development if you want. A better way of using `qualia:reval` is via an editor plugin. Currently there are plugins for Sublime Text and Spacemacs (not currently online yet), but it is extremely simple to write new plugins; just `POST` the text of the file you want to reload to `localhost:3000/reload/reload?filePath=/path/to/some/file.html|js|css`.

## Caveats

This is still under active development and may undergo backwards-incompatible changes. I haacked this together pretty quickly, so it might break. The editor plugins should be coming soon. The as-you-type functionality is implemented at the editor level.
