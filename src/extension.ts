import * as vscode from 'vscode';
import { gitBlame } from './blamer';
import { runCode } from './runner';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('runner123.run', runCode));

	//enable / disable git blame
	context.subscriptions.push(vscode.commands.registerCommand("runner123.switchBlameMode", () => {
		//get the mode
		let config: any = vscode.workspace.getConfiguration("runner123");
		
		//change the mode
		let newMode = "Show";
		if(config.get("gitBlameMode") === "Show") newMode = "Hide";
		config.update("gitBlameMode", newMode);
	}));

	//state update for git blame
	context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(gitBlame),
    vscode.window.onDidChangeTextEditorVisibleRanges(gitBlame),
    vscode.workspace.onDidSaveTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined && e === editor.document) {
        gitBlame({ textEditor: editor });
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {	}