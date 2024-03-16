import * as vscode from "vscode";
import * as cp from "child_process";

const decorationType = vscode.window.createTextEditorDecorationType({
  after: {
    textDecoration: "none; opacity: 0.25;",
    margin: "0 0 0 6em",
  },
});

export function gitBlame(e: { readonly textEditor: vscode.TextEditor }) {
  //check if blame is on
  if (
    vscode.workspace.getConfiguration("runner123").get("gitBlameMode") ===
    "Hide"
  )
    return;

  const editor = e.textEditor;
  const { uri: file, isDirty } = editor.document;
  const workspaceFolderPath =
    vscode.workspace.getWorkspaceFolder(file)?.uri.fsPath;
  const line = editor.document.lineAt(editor.selection.active.line);

  let args = [
    "blame",
    `-L ${line.lineNumber + 1},${line.lineNumber + 1}`,
    file.fsPath,
  ];

  if (isDirty) args.push("--content");

  let result = cp.spawn("git", args, { cwd: workspaceFolderPath });
  result.stdout.on("data", (data) => {
		let hash = data.toString().substring(0, data.indexOf(" ")).trim();
		
    //get commit data
    let msgResult = cp.spawn(
      "git",
      ["log", "-n 1", hash, "--date=iso"],
      { cwd: workspaceFolderPath }
    );

    msgResult.stdout.on("data", (data) => {
      editor.setDecorations(decorationType, formatBlame(data.toString(), hash, line));
    });
  });
}

function formatBlame(
  data: string,
	hash: string,
  line: vscode.TextLine
): vscode.DecorationOptions[] {
	let message = hash;

	// who?
	message += " • " + data.substring(data.indexOf("Author:") + 7, data.indexOf("<"));

	let dataMessage = data.substring(data.indexOf("Date:")+ 5, data.length);

	//when
	message += " • " + timeAgo(dataMessage.substring(0, dataMessage.indexOf("\n")));

	//why?
	message += " • " + dataMessage.substring(dataMessage.indexOf("+0000") + 5, dataMessage.length).trim();

	console.log(message);
	

  const range = new vscode.Range(
    line.lineNumber,
    line.text.length,
    line.lineNumber,
    line.text.length + message.length
  );

  const renderOptions = {
    after: {
      contentText: message,
			
    },
  };

  return [
    {
      range: range,
      hoverMessage: "",
      renderOptions: renderOptions,
    },
  ];
}

function timeAgo(dateString: string) {
	// convert date string into js date
	let date: Date = new Date(Date.parse(dateString));

	// calculate the time difference between the current date and the provided date
	const timeDiff = Math.abs(Date.now() - date.getTime());

	// calculate the number of years, months, days, hours, and minutes
	const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
	const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
	const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(timeDiff / (1000 * 60 * 60));
	const minutes = Math.floor(timeDiff / (1000 * 60));

	// construct the time ago message based on the calculated values
	let timeAgoMessage = "";
	if (years > 0) {
		timeAgoMessage = years + " year" + (years > 1 ? "s" : "") + " ago";
	} else if (months > 0) {
		timeAgoMessage = months + " month" + (months > 1 ? "s" : "") + " ago";
	} else if (days > 0) {
		timeAgoMessage = days + " day" + (days > 1 ? "s" : "") + " ago";
	} else if (hours > 0) {
		timeAgoMessage = hours + " hour" + (hours > 1 ? "s" : "") + " ago";
	} else if (minutes > 0) {
		timeAgoMessage = minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
	} else {
		timeAgoMessage = "just now";
	}

	return timeAgoMessage;

}