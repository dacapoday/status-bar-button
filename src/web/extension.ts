/* eslint-disable eqeqeq */
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('status-bar-button.buttons')) {
			Buttons.dispose();
			loadSettings(vscode.workspace.getConfiguration('status-bar-button').get('buttons') ?? []);
		}
	});
	loadSettings(vscode.workspace.getConfiguration('status-bar-button').get('buttons') ?? []);
}

export function deactivate() {
	Buttons.dispose();
}

function loadSettings(settings: ButtonSetting[]) {
	settings.forEach((setting: ButtonSetting, index: number) => {
		const name = setting.name ? "#" + setting.name : "@" + index;
		const text = setting.text ?? "^_^";
		const tooltip = setting.tooltip ?? text;
		const priority = setting.priority ?? 1;
		const group = setting.group ?? "";

		var alignment = vscode.StatusBarAlignment.Right;
		if (setting.alignment?.toLowerCase() == "left") {
			alignment = vscode.StatusBarAlignment.Left;
		}

		var activeColor = new vscode.ThemeColor('activityBar.foreground');
		if (setting.activeColor != null) {
			const colour = setting.activeColor.trim();
			if (colourNames.indexOf(colour.toLowerCase()) === -1) {
				if (colour[0] !== '#') {
					vscode.window.showInformationMessage("Unrecognised activeColor:" + colour);
				} else {
					activeColor = colour;
				}
			} else {
				activeColor = colour;
			}
		}
		var inactiveColor = new vscode.ThemeColor('activityBar.inactiveForeground');
		if (setting.inactiveColor != null) {
			const colour = setting.inactiveColor.trim();
			if (colourNames.indexOf(colour.toLowerCase()) === -1) {
				if (colour[0] !== '#') {
					vscode.window.showInformationMessage("Unrecognised inactiveColor:" + colour);
				} else {
					inactiveColor = colour;
				}
			} else {
				inactiveColor = colour;
			}
		}

		const button = (() => {
			if (setting.command != null) {
				if (Array.isArray(setting.command)) {
					return new Commands(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor, setting.command.map(command => loadCommand(command)));
				} else {
					return new Commands(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor, [loadCommand((setting.command as (string | CommandSetting)))]);
				}
			} else if (setting.view != null) {
				const view = setting.view.toLowerCase();
				if (!View.verify(view)) {
					vscode.window.showInformationMessage("Unrecognised view:" + view);
				} else {
					const text = setting.text ?? `$(${View.mapping[view].codicon})`;
					const tooltip = setting.tooltip ?? View.mapping[view].tooltip;
					const inPanel = setting.inPanel ?? ["problems", "output", "terminal", "console"].includes(view) ? true : false;
					return new View(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor, view, inPanel);
				}
			} else if (setting.display != null) {
				if (setting.display.toLowerCase() == "filesize") {
					const tooltip = setting.tooltip ?? "File Size";
					return new Filesize(group, name, alignment, priority, tooltip, activeColor, inactiveColor);
				}
			}
			return new Placeholder(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor);
		})();

		if (setting?.hide) {
			button.hide();
		} else {
			button.show();
		}
		Buttons.append(group, button);
	});
	Buttons.initState();
}

function loadCommand(setting: string | CommandSetting): CommandSetting {
	if (typeof setting === "string") {
		if (setting.toLowerCase().startsWith("http")) {
			return {
				type: "http",
				url: setting,
			};
		} else {
			return {
				type: "vscode",
				command: setting,
			};
		}
	}
	return setting;
}

interface ButtonSetting {
	readonly hide?: boolean
	readonly inPanel?: boolean
	readonly activeColor?: string
	readonly inactiveColor?: string
	readonly alignment?: string
	readonly group?: string
	readonly priority?: number
	readonly name?: string
	readonly text?: string
	readonly tooltip?: string
	readonly command?: (string | CommandSetting)[] | string | CommandSetting
	readonly view?: string;
	readonly display?: string;
}

interface CommandSetting {
	readonly type: string
	readonly command?: string
	readonly url?: string
}

class Buttons {
	private constructor() { }
	private static groups: Map<string, Map<string, ButtonFacade>> = new Map();
	public static currentView: string = "";
	public static dispose() {
		if (!Buttons.groups) { return; }
		Buttons.groups.forEach((group, _) => {
			group.forEach((button, _) => {
				button.dispose();
			});
			group.clear();
		});
		Buttons.groups.clear();
		return;
	}

	public static append(group: string, button: ButtonFacade) {
		if (!Buttons.groups.has(group)) {
			Buttons.groups.set(group, new Map());
		}
		Buttons.groups.get(group)?.set(button.name, button);
	}

	public static active(group: string, name: string) {
		if (group == "" || group[0] == "_") {
			return;
		}
		Buttons.groups.get(group)?.forEach((b, button) => {
			if (name == button) {
				b.active();
			} else {
				b.inactive();
			}
		});
	}

	public static initState() {
		Buttons.groups.forEach((g, group) => {
			if (group == "" || group[0] == "_") {
				g.forEach((b, _) => {
					b.active();
				});
			} else {
				g.forEach((b, _) => {
					b.inactive();
				});
			}
		});
	}
}

interface ButtonFacade {
	readonly name: string
	active: () => void
	inactive: () => void
	show: () => void
	hide: () => void
	dispose: () => void
}

class Placeholder {
	button: vscode.StatusBarItem;
	group: string;
	name: string;
	activeColor: vscode.ThemeColor;
	inactiveColor: vscode.ThemeColor;
	constructor(group: string, name: string,
		alignment: vscode.StatusBarAlignment,
		priority: number,
		text: string,
		tooltip: string,
		activeColor: (string | vscode.ThemeColor),
		inactiveColor: (string | vscode.ThemeColor),
	) {
		this.group = group;
		this.name = name;
		this.activeColor = activeColor;
		this.inactiveColor = inactiveColor;
		this.button = vscode.window.createStatusBarItem(group + alignment + name + priority, alignment, priority);
		this.button.text = text;
		this.button.tooltip = tooltip;
	}

	active() {
		this.button.color = this.activeColor;
	}

	inactive() {
		this.button.color = this.inactiveColor;
	}

	show() {
		this.button.show();
	}

	hide() {
		this.button.hide();
	}

	dispose() {
		this.button.dispose();
	}
}

class Commands extends Placeholder {
	current: number;
	total: number;
	command: vscode.Disposable;
	commands: (() => void)[];
	constructor(group: string, name: string,
		alignment: vscode.StatusBarAlignment,
		priority: number,
		text: string,
		tooltip: string,
		activeColor: (string | vscode.ThemeColor),
		inactiveColor: (string | vscode.ThemeColor),
		settings: CommandSetting[],
	) {
		super(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor);
		this.current = 0;
		this.commands = settings.map(setting => {
			if (setting.type == "vscode") {
				const command = setting.command ?? "";
				return () => {
					vscode.commands.executeCommand(command);
				};
			}
			return () => { };
		});
		this.total = this.commands.length;
		const commandName = 'status-bar-button.commands-' + group + name + (group.length - name.length);
		this.command = vscode.commands.registerCommand(commandName, this.exec, this);
		this.button.command = commandName;
	}

	exec() {
		Buttons.active(this.group, this.name);
		this.commands[this.current % this.total]();
		this.current += 1;
	}

	dispose() {
		this.command.dispose();
		this.commands.splice(0);
		super.dispose();
	}
}

class Filesize extends Placeholder {
	disposes: vscode.Disposable[];
	constructor(group: string, name: string,
		alignment: vscode.StatusBarAlignment,
		priority: number,
		tooltip: string,
		activeColor: (string | vscode.ThemeColor),
		inactiveColor: (string | vscode.ThemeColor),
	) {
		super(group, name, alignment, priority, "", tooltip, activeColor, inactiveColor);
		this.disposes = [];
		this.disposes.push(vscode.workspace.onDidSaveTextDocument(doc => {
			const textEditor = vscode.window.activeTextEditor;
			if (
				textEditor &&
				textEditor.document.fileName === doc.fileName
			) {
				this.render(textEditor.document.uri);
			}
		}, this));
		this.disposes.push(vscode.window.onDidChangeActiveTextEditor(textEditor => {
			if (textEditor) {
				this.render(textEditor.document.uri);
			} else {
				this.button.text = "";
			}
		}, this));
		const textEditor = vscode.window.activeTextEditor;
		textEditor && this.render(textEditor.document.uri);
	}

	format(size: number): string {
		if (size >= 1048576) { return `${Math.floor(size / 10485.76) / 100} MiB`; }
		else if (size >= 1024) { return `${Math.floor(size / 10.24) / 100} KiB`; }
		else { return `${size} B`; }
	}

	render(uri: vscode.Uri) {
		vscode.workspace.fs.stat(uri).then(stat => {
			const filesize = this.format(stat.size);
			this.button.text = filesize;
		});
	}

	dispose() {
		this.disposes.forEach(e => e.dispose());
		this.disposes.splice(0);
		super.dispose();
	}
}

class View extends Placeholder {
	public static mapping: { [key: string]: { [key: string]: string } } = {
		"explorer": {
			"codicon": "files",
			"tooltip": "Explorer",
			"command": "workbench.view.explorer"
		},
		"search": {
			"codicon": "search",
			"tooltip": "Search",
			"command": "workbench.view.search"
		},
		"scm": {
			"codicon": "source-control",
			"tooltip": "Source Control",
			"command": "workbench.view.scm"
		},
		"debug": {
			"codicon": "debug",
			"tooltip": "Debug",
			"command": "workbench.view.debug"
		},
		"extensions": {
			"codicon": "extensions",
			"tooltip": "Extensions",
			"command": "workbench.view.extensions"
		},
		"problems": {
			"codicon": "warning",
			"tooltip": "Problems",
			"command": "workbench.actions.view.problems"
		},
		"output": {
			"codicon": "output",
			"tooltip": "Output",
			"command": "workbench.panel.output.focus"
		},
		"terminal": {
			"codicon": "terminal",
			"tooltip": "Terminal",
			"command": "workbench.action.terminal.focus"
		},
		"console": {
			"codicon": "debug-console",
			"tooltip": "Debug Console",
			"command": "workbench.debug.action.toggleRepl"
		}
	};
	private static views = new Set(Object.keys(View.mapping));
	public static verify(view: string): boolean {
		return View.views.has(view);
	}

	command: vscode.Disposable;
	constructor(group: string, name: string,
		alignment: vscode.StatusBarAlignment,
		priority: number,
		text: string,
		tooltip: string,
		activeColor: (string | vscode.ThemeColor),
		inactiveColor: (string | vscode.ThemeColor),
		view: string,
		inPanel: boolean,
	) {
		super(group, name, alignment, priority, text, tooltip, activeColor, inactiveColor);

		const exec = (() => {
			const command = View.mapping[view].command;
			return () => {
				const current = Buttons.currentView;
				if (current === "" || current !== view) {
					Buttons.active(this.group, this.name);
					vscode.commands.executeCommand(command);
					Buttons.currentView = view;
				} else {
					Buttons.active(this.group, "");
					if (inPanel) {
						vscode.commands.executeCommand("workbench.action.togglePanel");
					} else {
						vscode.commands.executeCommand("workbench.action.toggleSidebarVisibility");
					}
					Buttons.currentView = "";
				}
			};
		})();

		const commandName = 'status-bar-button.view-' + group + name + (group.length - name.length);
		this.command = vscode.commands.registerCommand(commandName, exec, this);
		this.button.command = commandName;
	}

	dispose() {
		this.command.dispose();
		super.dispose();
	}
}

class Task extends Placeholder { }
class Clock extends Placeholder { }

const colourNames = [
	'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
	'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate',
	'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod',
	'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid',
	'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
	'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
	'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green',
	'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
	'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
	'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
	'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
	'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
	'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
	'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
	'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red',
	'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna',
	'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
	'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white',
	'whitesmoke', 'yellow', 'yellowgreen'
];
