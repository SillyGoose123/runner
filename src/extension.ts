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
	switch (path.substring(path.lastIndexOf("."), path.length)) {
		case ".c":
			delFile(path.substring(0, path.lastIndexOf(".")) + ".exe");
			return "gcc " + path + " -o " + path.substring(0, path.lastIndexOf(".")) + ".exe && " + path.substring(0, path.lastIndexOf(".")) + ".exe" ; 
	
		case ".cpp":
			delFile(path.substring(0, path.lastIndexOf(".")) + ".exe");
			return "g++ " + path + " -o " + path.substring(0, path.lastIndexOf(".")) + ".exe && " + path.substring(0, path.lastIndexOf(".")) + ".exe" ; 

		case ".java":
			return "java " + path;

		case ".py":
			return "python " + path;

		case ".bpy":
			return "BetterPy \"" + path + "\"";

		case ".rs":
			return "cd "+ path.substring(0, path.lastIndexOf("\\")) +  " && cargo run && ./target\\debug\\ " + path.substring(0, path.lastIndexOf(".")) + ".exe";
			

		default:
			return "failed";
	}
}

function delFile(params:String) {
	var h = vscode.window.createTerminal("haha")
	h.sendText("del " + params);
	h.dispose();
}

// This method is called when your extension is deactivated
export function deactivate() {}
