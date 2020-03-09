import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('drawioPreview.start', () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor || !editor.document.fileName.toLowerCase().endsWith('.drawio')) {
                vscode.window.showErrorMessage('Please open drawio file first.');
                return;
            }

            const panel = vscode.window.createWebviewPanel(
                'drawioPreview',
                'Preview: ' + path.basename(editor.document.fileName),
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );

            panel.webview.html = getHtmlContent(context, panel, editor.document.getText());
        })
    );
}

function getHtmlContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, content: string): string {
    content = content.replace(/<!--.*?-->/gs, '').trim();

    const config = JSON.stringify({
        highlight: '#00afff',
        lightbox: false,
        nav: true,
        resize: true,
        toolbar: 'zoom layers',
        xml: content
    });

    const escapeHtml = (html: string) => {
        return html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const viewerJs = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'assets', 'viewer.min.js')))

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Drawio Preview</title>
        <style>
          ::selection {
            background: #d3d3d3;
          }

          ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }

          ::-webkit-scrollbar-track {
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.1);
          }

          ::-webkit-scrollbar-thumb {
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.09);
            box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.1);
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .mxgraph {
            max-width: 100%;
          }

          .geDiagramContainer {
            max-width: 100%;
            max-height: 100%;
          }

          body {
            background: #fff;
          }
        </style>
    </head>
    <body>
        <div class="mxgraph" data-mxgraph="${escapeHtml(config)}"></div>
        <script src="${viewerJs}"></script>
    </body>
    </html>
  `;
}
