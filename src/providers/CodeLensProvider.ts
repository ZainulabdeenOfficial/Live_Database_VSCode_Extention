import * as vscode from 'vscode';
import { QueryExecutor } from '../database/QueryExecutor';

export class CodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(private queryExecutor: QueryExecutor) {}

    refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const lineCount = document.lineCount;

        for (let i = 0; i < lineCount; i++) {
            const line = document.lineAt(i).text;
            
            // Check for database comment pattern
            const commentMatch = line.match(/\/\/\s*db:\s*(.+)/);
            if (commentMatch) {
                const query = commentMatch[1].trim();
                const range = new vscode.Range(i, 0, i, line.length);
                
                // Add run query code lens
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '$(play) Run Query',
                    command: 'liveDB.runQuery',
                    arguments: []
                }));

                // Add generate query code lens
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '$(lightbulb) Generate SQL',
                    command: 'liveDB.generateQuery',
                    arguments: []
                }));

                continue;
            }

            // Check for SQL queries
            if (this.isSQLQuery(line)) {
                const range = new vscode.Range(i, 0, i, line.length);
                
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '$(play) Run SQL',
                    command: 'liveDB.runQuery',
                    arguments: []
                }));

                continue;
            }

            // Check for MongoDB queries
            if (this.isMongoQuery(line)) {
                const range = new vscode.Range(i, 0, i, line.length);
                
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '$(play) Run MongoDB',
                    command: 'liveDB.runQuery',
                    arguments: []
                }));

                continue;
            }
        }

        return codeLenses;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        if (!this.queryExecutor.isConnected()) {
            codeLens.command = {
                title: '$(error) Not Connected',
                command: 'liveDB.connectDatabase',
                arguments: []
            };
        }
        
        return codeLens;
    }

    private isSQLQuery(line: string): boolean {
        const sqlKeywords = [
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
            'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION'
        ];
        
        const upperLine = line.toUpperCase().trim();
        return sqlKeywords.some(keyword => upperLine.includes(keyword));
    }

    private isMongoQuery(line: string): boolean {
        return line.includes('db.') && (
            line.includes('.find(') || 
            line.includes('.aggregate(') || 
            line.includes('.insert(') || 
            line.includes('.update(') || 
            line.includes('.delete(')
        );
    }
}
