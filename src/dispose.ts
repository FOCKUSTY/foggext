import * as vscode from 'vscode';

export function disposeAll(disposables: vscode.Disposable[]): void {
	while (disposables.length) {
		const item = disposables.pop();

		if (!item) {
      continue;
    }
		
    item.dispose();
	}
}

export abstract class Disposable {
	private _disposed = false;

	protected readonly _disposables: vscode.Disposable[] = [];

	public dispose() {
		if (this._disposed) {
			return;
		}

		this._disposed = true;
		
    disposeAll(this._disposables);
	}

	protected _register<T extends vscode.Disposable>(value: T): T {
		if (this._disposed) {
			value.dispose();
		} else {
			this._disposables.push(value);
		}

    return value;
	}

	protected get disposed(): boolean {
		return this._disposed;
	}
}