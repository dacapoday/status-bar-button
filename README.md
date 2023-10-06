# status-bar-button

A VSCode plugin that provides programmable buttons for the Status Bar.
Inspired by [activitusbar](https://github.com/Gruntfuggly/activitusbar),
[Code Navigation](https://marketplace.visualstudio.com/items?itemName=vikas.code-navigation) and [file-size](https://github.com/zhcode-fun/file-size).

![Demo buttons in status bar](https://github.com/dacapoday/status-bar-button/blob/main/doc/screenshoot.png)

The goal is to provide a elegant editor UI without losing functionality.

## features
* Is Web extension, support `https://vscode.dev`
* Can replace ActivityBar to save space.
* Provide FileSize Info.
* Provide Code Navigation button.
* Exposed `vscode.StatusBarItem` low-level interface for convenient customization.

## configuration

This is a array containing objects with group name, their associated labels or icons and optional tooltips. 

The basic config look like:
```json
    {
        "group": " group-name or _group_name_ ",
        "text": " label and/or `$(icon-name)` ",
        "tooltip": " optional ",
        "alignment": " `left` or `right` ",
        "priority": 100,
        "activeColor": " html/css color name ",
        "inactiveColor": " or just `#ff00ff` "
    }
```
No required properties, all properties have appropriate default values.

`group` provides selection highlighting for a group of buttons.
If you want a group cancel the highlighting effect, the group name needs to start with an underscore.
Highlight color can be configured via `activeColor` and `inactiveColor`.

`text` is the button label, if you want to choose an icon, please use `"$(icon-name)"` format.
icon-name can be found at [codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html).

The button has three uses: replace ActivityBar, execute vscode command, or displays filesize.

If you want to replace ActivityBar then:
```json
    {
        //... basic config ...
        "view":" view name "
    }
```

The view name includes:
* "explorer"
* "search"
* "scm"
* "debug"
* "extensions"
* "problems"
* "output"
* "terminal"
* "console"

If the view is in the panel (such as search in panel), then
```json
    {
        //... basic config ...
        "view": " view name ",
        "inPanel": true
    }
```

If you want to exec vscode command (such as do code navigation), then
```json
    {
        //... basic config ...
        "command": "workbench.action.navigateBack"
    }
```
You can review the full set of VS Code commands via the Keyboard Shortcuts editor File > Preferences (Code > Preferences or Code > Settings on macOS) > Keyboard Shortcuts. The Keyboard Shortcuts editor lists all commands built into VS Code or contributed by extensions, along with their keybindings and visibility when clauses.

Or just use the button as a display to show the size of the currently active file
```json
    {
        //... basic config ...
        "display":"filesize"
    }
```

## example setting

```json
  "status-bar-button.buttons": [
    {
        "group": "_nav",
        "text": "$(arrow-left)",
        "tooltip": "Back",
        "command": "workbench.action.navigateBack",
        "alignment": "right",
        "priority": 1000,
    },
    {
      "group": "_nav",
      "text": " ",
      "tooltip": "placeholder",
      "alignment": "right",
      "priority": 1000,
    },
    {
        "group": "_nav",
        "text": "$(arrow-right)",
        "tooltip": "Forward",
        "command": "workbench.action.navigateForward",
        "alignment": "right",
        "priority": 1000,
    },
    {
        "alignment": "left",
        "priority": -1000,
        "display":"filesize",
    },
    {
        "text": "$(settings-gear)Open Settings",
        "tooltip": "Open Settings",
        "alignment": "left",
        "priority": 1000,
        "command": "workbench.action.openSettings",
    },
    {
        "text": "$(layout-activitybar-left)",
        "tooltip": "ActivityBar",
        "alignment": "left",
        "priority": 9999,
        "command": "workbench.action.toggleActivityBarVisibility",
    },
    {
        "group": "ViewBar",
        "alignment": "right",
        "priority": 1000,
        "view":"explorer",
    },
    {
        "group": "ViewBar",
        "alignment": "right",
        "priority": 1000,
        "view":"scm",
    },
    {
        "group": "ViewBar",
        "alignment": "right",
        "priority": 1000,
        "view":"debug",
    },
    {
        "group": "ViewBar",
        "alignment": "right",
        "priority": 1000,
        "view":"extensions",
    },
    {
        "group": "ViewBar",
        "inPanel":false,
        "alignment": "right",
        "priority": 1000,
        "view":"search",
    },
    {
        "group": "ViewPanel",
        "alignment": "left",
        "priority": -9000,
        "view":"problems",
    },
    {
        "group": "ViewPanel",
        "alignment": "left",
        "priority": -9000,
        "view":"output",
    },
    {
        "group": "ViewPanel",
        "alignment": "left",
        "inactiveColor": "purple",
        "priority": -9000,
        "view":"terminal",
    },
    {
        "group": "ViewPanel",
        "activeColor":"yellow",
        "alignment": "left",
        "priority": -9000,
        "view":"console",
    }
  ]
```

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=dacapoday.status-bar-button).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

```sh
> ext install status-bar-button
```

### Source Code

The source code is available on GitHub [here](https://github.com/dacapoday/status-bar-button).