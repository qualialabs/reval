# qualia:reval - Instant Meteor reloads

Demo Video: https://www.youtube.com/watch?v=t18GPNZ7_Xg

This package allows you to instantly reload files in the browser. We've only tested that Blaze HTML/JS/CSS files work well, but any code that can be reloaded by being eval'ed on the client should work. At some point in the future, support for:
  - server side reloading
  - a wider variety of file types will be added (React templates, meteor methods, meteor publications, etc.)

This is a dev-only package so you don't have to worry about it being deployed to prod.

## Installing

`meteor add qualia:reval`

## Getting Started

Visit `localhost:3000/reval/edit?filePath=/path/to/some/file.html|js|css`. This will load the file into Ace (an in-browser code editor). Typing `CMD+s` will reload the file in your browser and `CMD+S` will save your changes to disk.

This mode is primarily for testing `qualia:reval`, although you could use it for development if you want. A better way of using `qualia:reval` is via an editor plugin. Currently there are plugins for Sublime Text and Spacemacs (see the `plugins/` folder), but it is extremely simple to write new plugins; just `POST` the text of the file you want to reload to `localhost:3000/reval/reload?filePath=/path/to/some/file.html|js|css`.

## Caveats

This is still under active development and may undergo backwards-incompatible changes. I hacked this together pretty quickly, so it might break. The as-you-type functionality shown in the demo is implemented at the editor level and not yet included in the published plugins.
