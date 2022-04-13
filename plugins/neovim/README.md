# NeoVim Plugin for reval

## Dependencies

* NeoVim >=0.6
* `plenary.curl`

## Installation

Clone this repo and run

```sh
git clone https://github.com/qualialabs/reval
cd plugins/neovim
make link
```

## Use

Begin by editing a given file that you will eventually want to `reval`. Once the
edits are made, simply run `:Reval` (saving the file is not needed). The plugin
will search up for a `.revalrc` file that contains the reval host for it to send
the updated file contents to. If no `.revalrc` file is found, the default host
of `localhost:3000` is used. If you need to send the reval request to a host
other than `localhost:3000`, simply pass that argument to the command: `:Reval localhost:4000`.
If no `.revalrc` file is present, subsequent uses of the `:Reval` invocation
will use the same host.
