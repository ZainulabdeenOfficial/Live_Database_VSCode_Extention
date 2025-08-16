import * as vscode from 'vscode';
import { QueryResult } from '../database/connections/DatabaseConnection';

export class ResultsPanel {
    private static currentPanel: ResultsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri): ResultsPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ResultsPanel.currentPanel) {
            ResultsPanel.currentPanel._panel.reveal(column);
            return ResultsPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'liveDBResults',
            'Query Results',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out/compiled')
                ]
            }
        );

        ResultsPanel.currentPanel = new ResultsPanel(panel, extensionUri);
        return ResultsPanel.currentPanel;
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public async showResults(results: QueryResult) {
        this._panel.webview.html = this._getHtmlForWebview(results);
    }

    public show() {
        this._panel.reveal();
    }

    public dispose() {
        ResultsPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = "Query Results";
        this._panel.webview.html = this._getHtmlForWebview(null);
    }

    private _getHtmlForWebview(results: QueryResult | null): string {
        if (!results) {
            return this._getEmptyHtml();
        }

        const tableRows = results.rows.map(row => {
            const cells = results.columns.map(col => {
                const value = row[col];
                const displayValue = value === null || value === undefined ? 'NULL' : String(value);
                return `<td>${this.escapeHtml(displayValue)}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        const tableHeaders = results.columns.map(col => 
            `<th onclick="sortTable(this)">${this.escapeHtml(col)}</th>`
        ).join('');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Query Results</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .stats {
                    display: flex;
                    gap: 20px;
                    font-size: 14px;
                    color: var(--vscode-descriptionForeground);
                }
                .stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                }
                th {
                    background-color: var(--vscode-list-hoverBackground);
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: 600;
                    cursor: pointer;
                    user-select: none;
                    border-bottom: 2px solid var(--vscode-panel-border);
                }
                th:hover {
                    background-color: var(--vscode-list-activeSelectionBackground);
                }
                td {
                    padding: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    word-break: break-word;
                }
                tr:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    margin-top: 20px;
                }
                .pagination button {
                    padding: 8px 12px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .pagination button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .pagination button:disabled {
                    background-color: var(--vscode-disabledForeground);
                    cursor: not-allowed;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Query Results</h2>
                <div class="stats">
                    <div class="stat">
                        <span>Rows:</span>
                        <strong>${results.rowCount}</strong>
                    </div>
                    <div class="stat">
                        <span>Columns:</span>
                        <strong>${results.columns.length}</strong>
                    </div>
                    <div class="stat">
                        <span>Time:</span>
                        <strong>${results.executionTime}ms</strong>
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table id="resultsTable">
                    <thead>
                        <tr>${tableHeaders}</tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>

            <script>
                let currentSortColumn = -1;
                let currentSortDirection = 'asc';

                function sortTable(header) {
                    const table = document.getElementById('resultsTable');
                    const tbody = table.getElementsByTagName('tbody')[0];
                    const rows = Array.from(tbody.getElementsByTagName('tr'));
                    const columnIndex = Array.from(header.parentNode.children).indexOf(header);

                    // Remove sort indicators from all headers
                    const headers = table.getElementsByTagName('th');
                    for (let i = 0; i < headers.length; i++) {
                        headers[i].textContent = headers[i].textContent.replace(' ▲', '').replace(' ▼', '');
                    }

                    // Determine sort direction
                    if (currentSortColumn === columnIndex) {
                        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSortDirection = 'asc';
                        currentSortColumn = columnIndex;
                    }

                    // Add sort indicator
                    header.textContent += currentSortDirection === 'asc' ? ' ▲' : ' ▼';

                    // Sort rows
                    rows.sort((a, b) => {
                        const aValue = a.children[columnIndex].textContent;
                        const bValue = b.children[columnIndex].textContent;
                        
                        // Try to compare as numbers first
                        const aNum = parseFloat(aValue);
                        const bNum = parseFloat(bValue);
                        
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            return currentSortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                        }
                        
                        // Fall back to string comparison
                        const comparison = aValue.localeCompare(bValue);
                        return currentSortDirection === 'asc' ? comparison : -comparison;
                    });

                    // Reorder rows in the table
                    rows.forEach(row => tbody.appendChild(row));
                }

                // Add keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 'f') {
                        e.preventDefault();
                        // Could implement search functionality here
                    }
                });
            </script>
        </body>
        </html>`;
    }

    private _getEmptyHtml(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Query Results</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="empty-state">
                <h3>No Results</h3>
                <p>Run a query to see results here.</p>
            </div>
        </body>
        </html>`;
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
