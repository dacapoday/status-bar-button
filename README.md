# status-bar-button

A VSCode plugin that provides programmable buttons for the Status Bar.

## feature
0. Support installation to `vscode.dev`.
1. Save space of ActivityBar. 
2. Provide FileSize Info.
3. Provide Code Navigation button.
4. Provide `vscode.StatusBarItem` low-level interface for convenient customization.

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
        "text": "$(settings-gear)",
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
