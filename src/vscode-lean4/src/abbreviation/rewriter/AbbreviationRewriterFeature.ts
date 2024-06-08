import { observable } from 'mobx';
import { Disposable, languages, TextEditor, window } from 'vscode';
import { autorunDisposable } from '../../utils/autorunDisposable';
import { AbbreviationProvider } from '../AbbreviationProvider';
import { AbbreviationConfig } from '../config';
import { AbbreviationRewriter } from './AbbreviationRewriter';

/**
 * Sets up everything required for the abbreviation rewriter feature.
 * Creates an `AbbreviationRewriter` for the active editor.
 */
export class AbbreviationRewriterFeature {
	private readonly disposables = new Array<Disposable>();

	private abbreviationRewriter: AbbreviationRewriter | undefined;

	constructor(
		private readonly config: AbbreviationConfig,
		abbreviationProvider: AbbreviationProvider
	) {
		this.disposables.push(
			window.onDidChangeActiveTextEditor((e) => {
				if (this.abbreviationRewriter) {
					this.abbreviationRewriter.dispose()
				}
				if (e && this.shouldEnableRewriterForEditor(e)) {
					// This creates an abbreviation rewriter for the active text editor.
					// Old rewriters are disposed automatically.
					// This is also updated when this feature is turned off/on.
					this.abbreviationRewriter = new AbbreviationRewriter(
						config,
						abbreviationProvider,
						e
					)
					this.disposables.push(this.abbreviationRewriter)
				}
			})
		);
	}

	private shouldEnableRewriterForEditor(editor: TextEditor): boolean {
		if (!this.config.inputModeEnabled.get()) {
			return false;
		}
		if (!languages.match(this.config.languages.get(), editor.document)) {
			return false;
		}
		return true;
	}

	dispose(): void {
		for (const d of this.disposables) {
			d.dispose();
		}
	}
}
