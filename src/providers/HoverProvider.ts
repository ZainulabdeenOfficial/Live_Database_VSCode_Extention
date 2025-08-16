import * as vscode from 'vscode';
import { QueryExecutor } from '../database/QueryExecutor';
import { AIQueryGenerator } from '../ai/AIQueryGenerator';

export class HoverProvider implements vscode.HoverProvider {
    constructor(
        private queryExecutor: QueryExecutor,
        private aiGenerator: AIQueryGenerator
    ) {}

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const line = document.lineAt(position.line).text;
        
        // Check for database comment pattern
        const commentMatch = line.match(/\/\/\s*db:\s*(.+)/);
        if (commentMatch) {
            const query = commentMatch[1].trim();
            return this.createHoverForQuery(query, position);
        }

        // Check for SQL queries
        if (this.isSQLQuery(line)) {
            return this.createHoverForSQL(line, position);
        }

        // Check for MongoDB queries
        if (this.isMongoQuery(line)) {
            return this.createHoverForMongo(line, position);
        }

        return null;
    }

    private createHoverForQuery(query: string, position: vscode.Position): vscode.Hover {
        const contents = new vscode.MarkdownString();
        
        contents.appendMarkdown('**Database Query**\n\n');
        contents.appendMarkdown(`\`${query}\`\n\n`);
        
        if (this.queryExecutor.isConnected()) {
            contents.appendMarkdown('💡 **Run this query with:** `Ctrl+Shift+Q`\n\n');
            contents.appendMarkdown('🔧 **Generate SQL with:** `Ctrl+Shift+G`\n\n');
            
            const connectionName = this.queryExecutor.getCurrentConnectionName();
            const dbType = this.queryExecutor.getCurrentDatabaseType();
            
            contents.appendMarkdown(`**Connected to:** ${connectionName} (${dbType})\n\n`);
        } else {
            contents.appendMarkdown('⚠️ **Not connected to database**\n\n');
            contents.appendMarkdown('Connect to a database to run queries.\n\n');
        }

        contents.isTrusted = true;
        return new vscode.Hover(contents);
    }

    private createHoverForSQL(sql: string, position: vscode.Position): vscode.Hover {
        const contents = new vscode.MarkdownString();
        
        contents.appendMarkdown('**SQL Query**\n\n');
        contents.appendMarkdown(`\`\`\`sql\n${sql}\n\`\`\`\n\n`);
        
        if (this.queryExecutor.isConnected()) {
            contents.appendMarkdown('💡 **Run this query with:** `Ctrl+Shift+Q`\n\n');
            
            const connectionName = this.queryExecutor.getCurrentConnectionName();
            const dbType = this.queryExecutor.getCurrentDatabaseType();
            
            contents.appendMarkdown(`**Connected to:** ${connectionName} (${dbType})\n\n`);
        } else {
            contents.appendMarkdown('⚠️ **Not connected to database**\n\n');
        }

        contents.isTrusted = true;
        return new vscode.Hover(contents);
    }

    private createHoverForMongo(mongoQuery: string, position: vscode.Position): vscode.Hover {
        const contents = new vscode.MarkdownString();
        
        contents.appendMarkdown('**MongoDB Query**\n\n');
        contents.appendMarkdown(`\`\`\`javascript\n${mongoQuery}\n\`\`\`\n\n`);
        
        if (this.queryExecutor.isConnected()) {
            contents.appendMarkdown('💡 **Run this query with:** `Ctrl+Shift+Q`\n\n');
            
            const connectionName = this.queryExecutor.getCurrentConnectionName();
            const dbType = this.queryExecutor.getCurrentDatabaseType();
            
            contents.appendMarkdown(`**Connected to:** ${connectionName} (${dbType})\n\n`);
        } else {
            contents.appendMarkdown('⚠️ **Not connected to database**\n\n');
        }

        contents.isTrusted = true;
        return new vscode.Hover(contents);
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
        return line.includes('db.') && (line.includes('.find(') || line.includes('.aggregate(') || line.includes('.insert(') || line.includes('.update(') || line.includes('.delete('));
    }
}
