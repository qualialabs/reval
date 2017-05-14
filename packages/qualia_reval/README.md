# qualia:reval - Instant Meteor reloads

This package allows you to instantly reload files in the browser. It works with Blaze, Jade, CSS, and arbitrary Javascript, both client-side and server-side. It also allows for live, collaborative code editing via an integration with (Ngrok)[https://ngrok.com].

This is a dev-only package so you don't have to worry about it being deployed to prod. However, deploying Reval to prod has certainly crossed my mind... hotfixing a bug in 30 seconds without reloading a user's browser would be pretty badass.

Right now only Chrome accessing Meteor servers running on OSX/Linux are officially supported. It could definitely be made to work on other browsers & OS's but I haven't made any effort to do that right now.

## Installing

`meteor add qualia:reval`

## Getting Started

There are two main ways to use Reval, through (a) the in-browser editor or (b) an editor plugin.

You can open up the in-browser editor by either typing `Cmd/Ctrl+i`, clicking anywhere on the page while holding down `Cmd/Ctrl`, or clicking the small `</>` icon in the bottom right hand corner of the screen. The editing environment has two panes: a code editing pane and a secondary pane which shows all active "code patches" (i.e. changes that you have made but not yet saved to disk). The code editing pane allows you to browse between a template's html/js/css files. By default it will re-evaluate the file as you type, but if this gets annoying you can switch from `Live` mode to `On Save` mode by clicking the button in the top right corner of the code editing pane. The secondary pane is used to persist or clear any changes that you've made. The top right corner of the secondary pane also allows you to search through templates on your project. The `Publish` button will generate a public URL through which other users can access this website (be warned that unless you have a paid subscription to Ngrok, the URL will regenerate on every server reload). Note that trying to access templates that are not present in the source tree of your Meteor project will not work (Reval doesn't know where to find the source code or where to save code patches to disk).

Using Reval via an editor plugin is often better for heavy usage. People tend to be somewhat attached to their particular code editor of choice. See the `plugins/` folder for example editor plugins. If your editor isn't supported yet, it's super easy to add support (you just need to send a POST request to the Meteor server containing the code and file path of the file you'd like to reload). Patches made via editor plugins will still show up in the in-browser editor. If you save a file through your editor which has been patched, the patch will automatically be dropped (so you don't have to worry about manually clearing any patches after saving a file).

## Caveats
This package does a ton of hacks and I can make no guarantees about its stability or the backwards compatibility of future version. But, that said, have fun :)
