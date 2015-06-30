# Tron-CLI
Version
0.2.0

Tron-CLI is a quick way to create and run your [Electron](http://electron.atom.io/) projects.

Tron offers 4 major things

  - Create an entire barebones Electron project from scratch in your project directory
  - Run your project in development mode via Tron's CLI
  - Run and list your components (assuming they can be run standalone)
  - Rebuild your node modules for Electron (courtesy electron-rebuild)


Tron does NOT offer a way to make application distributions, it's strictly for development usage. For this, you may want to try [Electron-Packager](https://github.com/maxogden/electron-packager)


### Installation

```
$ npm install tron-cli
```

### Usage

** All commands **

Get the Tron version:
```
$ tron version
```

Get Tron help
```
$ tron --help
```

Create a Tron project
```
$ tron create
```

Run your Tron project
```
$ tron run
```

Run a component demo
```
$ tron comp <component name>
```

Run a component demo or main project in debug mode
```
$ tron run -d
$ tron run --debug
$ tron comp <component name> --debug
$ tron comp <component name> -d
```

Run a component demo or main project in fullscreen mode
```
$ tron run -f
$ tron run --fullscreen
$ tron comp <component name> --fullscreen
$ tron comp <component name> -f
```

List components
```
$ tron comp list
```

List components of a certain prefix (ex: Polymer's paper-button)
```
$ tron comp list --prefix paper
$ tron comp list -p paper
```

Download Electron binaries (without using tron create)
```
$ tron installelectron
```

Make Tron config file (without using tron create)
```
$ tron makeconfig
```

View Tron config in shell
```
$ tron defaults
```

Rebuild your Electron Application's Node Modules
```
$ tron rebuild
```

** Basic Usage **

Once installed, Tron-CLI will be available via the command line. To demonstrate that it's installed and working you can try the following basic commands:
```
$ tron version
```

```
$ tron --help
```

** Create your project **

Electron is honestly super easy to use and get going, but there can be a fair number of steps to get a barebones project up and running. For newcomers to Electron, if you make a bad package.json file, you'll get a broken project without a helpful error message to tell you what went wrong.

Additionally, there is little bit of code for creating your app and the window. Tron takes care of this for you. You may outgrow Tron's app startup code fairly quickly as your application gets bigger! That's why Tron is really for beginners or those that want to get an application setup in seconds and will start replacing code later.

To create your Tron project, go to the root of your project and type:

```
$ tron create
```

The "create" command does several things.
* Creates an 'app' folder for your Electron project files
* Creates a components directory, .bowerrc, and bower.json file
* Copies over some starter Electron application JS so you can run your application right away with no coding by you
* Copies over a package.json file and does the npm install for you
* Downloads the Electron binaries file into a binaries folder at your project root
* Creates an editable config file (tron.json) that you can tweak paths and settings for your Tron project

The "create" commaned won't overwrite any bower.json, package.json, .bowerrc, index.html, or main.js files you already have (although...please do be safe and backup your files in case there are any bugs with Tron)

Additionally, you can call pieces of the create through different commands:

To JUST download the Electron binaries:
```
$ tron installelectron
```

To JUST create a config file:
```
$ tron makeconfig
```

Any remaining tasks that "create" does can simply be done by grabbing files from your "node_modules/tron-cli/starter-files" folder. If this doesn't exist (because maybe you wiped out your node_modules folder), simply run "npm install tron-cli".

** Run your project **

Running your project is simple.

```
$ tron run
```

"Run" will target the <yourproject>/app/index.html file as the main HTML window for your application. "Run" DOES rely on some Javascript application logic provided by Tron - so if you chose not to use Tron's application JS, this command would not function.

Similarly, extra "run" arguments require Tron application code to function.
Currently the only arguments supported are -d (--debug) and -f (--fullscreen).

To run your project with the Chromium developer tools launched at start:
```
$ tron run -d
```

or

```
$ tron run --debug
```


** Working with Components **

Not all components are self-runnable. This part of Tron is heavily inspired for use with [Polymer](https://www.polymer-project.org). Polymer is geared towards Web Component creation, and an artifact of this workflow is that each and every component you make should be runnable and demonstratable on its own. Polymer is new, and subject to change, but it's demo files are typically run from <yourcomponent>/demo/index.html. Tron uses this path to target your component when trying to run it. This path can be changed via the "tron.config" file if you like.

To run a component demo:
```
$ tron comp <your component name>
```

Debug mode also works here:

```
$ tron comp <your component name> -d
```

Additionally. The "comp" (component) command can list out your components in the terminal. Assuming all bower.json files in your components are valid JSON, you can list your components like this:

```
$ tron comp list
```

This might not be INCREDIBLY useful - though, especially with Polymer, you may prefix your components a certain way using a dash. Polymer likes to suggest the following:

"<component namespace>-<component-name>"

So for example, Google's Material design components for Polymer are under the namespace "paper". So a button component would be "paper-button". This is where Tron's component lister may come in handy. If you'd like to make a list of all components with a specific prefix, use the --prefix or -p argument. So if you'd like to list all components in your project that are "paper", simply type:

```
$ tron comp list -p paper
```

### Thanks!
* [Github](https://github.com/) for Atom and Electron
* [Electron-Rebuild](https://github.com/paulcbetts/electron-rebuild) to rebuild your Node C++ based modules for Electron
* [Gulp-Download-Electron](https://github.com/kitematic/gulp-download-electron) because Tron uses it to download Electron binaries
* [Commander](https://github.com/tj/commander.js) because CLI tools like Tron are built more easily with it
* And any other dependencies Tron uses
