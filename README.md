# npm-unlink

a utility to simplify the usage of npm-link.

## install
For the moment i didn't do global GYP install, you have to do this yourself

    git clone git@github.com:ybootin/npm-unlink.git
    cd npm-unlink
    npm link
    ln -s /usr/local/lib/node_modules/npm-unlink/unlink.js /usr/local/bin/npm-unlink


## Usage
unlink all module locally

    npm-unlink

unlink a specific module locally

    npm-unlink my-module

unlink all module from the global cache and install the last version as substitute

    npm-unlink -g

unlink a specific module from the global cache

    npm-unlink -g my-module
