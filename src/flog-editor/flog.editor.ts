import * as vscode from 'vscode';
import { Disposable } from '../dispose';

interface IFlogEditor {
	readonly color: string;
	readonly stroke: ReadonlyArray<[number, number]>;
}

interface IFlogEditorDelegate {
	getFileData(): Promise<Uint8Array>;
}

class FlogEditor extends Disposable implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
	private readonly _delegate: IFlogEditorDelegate;
  
  private _edits: IFlogEditor[] = [];
	private _savedEdits: IFlogEditor[] = [];

  private _documentData: Uint8Array;

  private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		if (uri.scheme === 'untitled') {
			return new Uint8Array();
		}
		return new Uint8Array(await vscode.workspace.fs.readFile(uri));
	}

  static async create(
		uri: vscode.Uri,
    backupId: string | undefined,
		delegate: IFlogEditorDelegate,
	): Promise<FlogEditor | PromiseLike<FlogEditor>> {
    const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
		const fileData = await FlogEditor.readFile(dataFile);

		return new FlogEditor(uri, fileData, delegate);
	}

  private constructor(
		uri: vscode.Uri,
    initialContent: Uint8Array,
		delegate: IFlogEditorDelegate
  ) {
		super();
		
    this._uri = uri;
    this._documentData = initialContent;
		this._delegate = delegate;
	}

  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDidDispose = this._onDidDispose.event;

	private readonly _onDidChangeDocument = this._register(new vscode.EventEmitter<{
		readonly content?: Uint8Array;
		readonly edits: readonly IFlogEditor[];
	}>());

  public readonly onDidChangeContent = this._onDidChangeDocument.event;

	private readonly _onDidChange = this._register(new vscode.EventEmitter<{
		readonly label: string,
		undo(): void,
		redo(): void,
	}>());

	public readonly onDidChange = this._onDidChange.event;

  public dispose(): void {
		this._onDidDispose.fire();
		super.dispose();
	}

  public makeEdit(edit: IFlogEditor) {
		this._edits.push(edit);

		this._onDidChange.fire({
			label: 'Stroke',
			undo: async () => {
				this._edits.pop();
				this._onDidChangeDocument.fire({
					edits: this._edits,
				});
			},
			redo: async () => {
				this._edits.push(edit);
				this._onDidChangeDocument.fire({
					edits: this._edits,
				});
			}
		});
	}

  public async save(cancellation: vscode.CancellationToken): Promise<void> {
		await this.saveAs(this.uri, cancellation);
		this._savedEdits = Array.from(this._edits);
	}

  public async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
		const fileData = await this._delegate.getFileData();
		if (cancellation.isCancellationRequested) {
			return;
		}
		await vscode.workspace.fs.writeFile(targetResource, fileData);
	}

  public async revert(_cancellation: vscode.CancellationToken): Promise<void> {
		const diskContent = await FlogEditor.readFile(this.uri);
		this._documentData = diskContent;
		this._edits = this._savedEdits;
		this._onDidChangeDocument.fire({
			content: diskContent,
			edits: this._edits,
		});
	}

  public async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
		await this.saveAs(destination, cancellation);

		return {
			id: destination.toString(),
			delete: async () => {
				try {
					await vscode.workspace.fs.delete(destination);
				} catch {
				}
			}
		};
	}
  
  public get uri() { return this._uri; }
	public get documentData(): Uint8Array { return this._documentData; }
}

export { FlogEditor, IFlogEditor, IFlogEditorDelegate };

export default FlogEditor;