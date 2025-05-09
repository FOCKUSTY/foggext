import * as vscode from 'vscode';
import FlogEditororProvider from './flog-editor/flog-editor.provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(FlogEditororProvider.register(context));
}

export function deactivate() {}
