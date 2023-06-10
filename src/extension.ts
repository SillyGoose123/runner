import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let command = vscode.commands.registerCommand('code-runner.RunCode', () => {
		//Save file 
		vscode.window.activeTextEditor?.document.save();

		//Check if workspace is trusted
		if(vscode.workspace.isTrusted){
			//get the file
			var path: String = vscode.window.activeTextEditor?.document.fileName + "";
			var fileName: String = path.substring(path.lastIndexOf("\\") + 1, path.length);
			
			// seach for terminal which run code and disponse them
			vscode.window.terminals.forEach(element => {
				if(element != null && element.name.includes("Run " + fileName)){
					element.dispose();
				}
			}); 
		
			//create terminal called "Run {filename}"
			var t = vscode.window.createTerminal("Run " + fileName);
			
			//get the command for the file ending
			var command: String = getCommand(path) +" ";
			if(command != null && !command.includes("failed") ){
				//send command
				t.sendText(command + "");
				//show the terminal
				t.show();
			}
			
		} else{
			vscode.window.showErrorMessage("Workspace isn't trusted.");
		}
		
	});

	context.subscriptions.push(command);
}

function getCommand(path:String) {
	var config = vscode.workspace.getConfiguration("code-runner");
	var command = "";
	var exe = path.substring(0, path.lastIndexOf(".")) + ".exe";
	switch (path.substring(path.lastIndexOf("."), path.length)) {
		case ".c":
			delFile(exe);
			command = config.get("c") + "";
			break;
	
		case ".cpp":
			delFile(exe);
			command = config.get("cpp") + "";
			break;

		case ".java":
			command = config.get("java") + "";
			break;

		case ".py":
			command = config.get("python") + "";
			break;

		case ".bpy":
			command = config.get("BetterPy") + "";
			break;

		case ".rs":
			command = config.get("rust") + "";
			break;
			
		default:
			return "failed";
	}

	while (command.includes("%File%")){
		command = command.replace("%File%", path + "");
	}

	while (command.includes("%Dir%")){
		command = command.replace("%Dir%", path.substring(0, path.lastIndexOf("\\")));
	}

	while (command.includes("%Exe%")){
		command = command.replace("%Exe%", exe);
	}

	return command;
	
}

function delFile(params:String) {
	var h = vscode.window.createTerminal("haha")
	h.sendText("taskkill -IM "+ params.substring(params.lastIndexOf("\\") + 1, params.length) + " /F && del " + params);
	h.dispose();
}

// This method is called when your extension is deactivated
export function deactivate() {}
