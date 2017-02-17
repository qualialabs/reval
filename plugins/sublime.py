# Create a new plugin: Sublime -> Tools -> Developer -> New Plugin
# Copy this file into the new plugin and save it as `qualia_reval.py`
# Bind reloading to a key by placing something like this in your keymap:
#         { "keys": ["ctrl+r"], "command": "qualia_reval"},
#
# If your server isn't located at localhost:3000, you can modify that
# reference on the `url = ...` line.

import sublime
import sublime_plugin
import urllib.request

class QualiaRevalCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    url = 'http://localhost:3000/reval/reload?filePath=' + self.view.file_name()
    data = self.view.substr(sublime.Region(0, self.view.size()))
    request = urllib.request.Request(url, data=str.encode(data), headers={'Content-type': 'text/plain'})
    urllib.request.urlopen(request)
