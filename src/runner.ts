import * as vscode from 'vscode';

export function runCode(fileUri: vscode.Uri) {
  	//Save file 
		vscode.window.activeTextEditor?.document.save();

		//Check if workspace is trusted
		if(!vscode.workspace.isTrusted){
			vscode.window.showErrorMessage("Workspace isn't trusted.");
			return;
		}
		
		//get the file
		var path: String = (fileUri != undefined ? fileUri.path.toString().substring(1, fileUri.path.length) : vscode.window.activeTextEditor?.document.fileName + "").replaceAll("\\", "/");

		if(path == null || path.trim() === "") {
			vscode.window.showErrorMessage("Couldn't get path.");
			return;
		}

		var fileName: String = path.substring(path.lastIndexOf("/") + 1, path.length);
		
		// seach for terminal which run code and disponse them
		vscode.window.terminals.forEach(terminal => {
			if(terminal != null && terminal.name.includes("Run " + fileName)){
				terminal.dispose();
			}
		}); 
	
		//create terminal called "Run {filename}"
		var t = vscode.window.createTerminal("Run " + fileName);
		
		//get the command for the file ending
		var command: string = getCommand(path, vscode.window.activeTextEditor?.document.languageId);
		if(command != null && !command.includes("failed") ){
			//send command
			t.sendText(command);
			//show the terminal
			t.show();
			//Show the it is running
			vscode.window.showInformationMessage("Running " + fileName);
		}		
}

function getCommand(path:String, lang: String | undefined) {
	let config = vscode.workspace.getConfiguration("runner123");
	let command = "";
	
	command = config.get((lang == undefined ? path.substring(path.lastIndexOf(".") + 1, path.length) : lang).toString()) + "";

	command = command.replaceAll("%File%", path + "");
	
	command = command.replaceAll("%Dir%", path.substring(0, path.lastIndexOf("/")));

	command = command.replaceAll("%Exe%",  path.substring(0, path.lastIndexOf(".")) + ".exe");
	

	return command;
	
}
