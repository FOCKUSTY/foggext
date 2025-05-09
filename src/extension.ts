import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "foggext" is now active!');
	const disposable = vscode.commands.registerCommand('foggext.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from foggext!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
