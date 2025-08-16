import * as vscode from 'vscode';
import { DatabaseManager } from './database/DatabaseManager';
import { QueryExecutor } from './database/QueryExecutor';
import { AIQueryGenerator } from './ai/AIQueryGenerator';
import { ResultsPanel } from './ui/ResultsPanel';
import { SchemaProvider } from './ui/SchemaProvider';
import { ConnectionsProvider } from './ui/ConnectionsProvider';
import { HistoryProvider } from './ui/HistoryProvider';
import { HoverProvider } from './providers/HoverProvider';
import { CodeLensProvider } from './providers/CodeLensProvider';

let databaseManager: DatabaseManager;
let queryExecutor: QueryExecutor;
let aiGenerator: AIQueryGenerator;
let resultsPanel: ResultsPanel;
let schemaProvider: SchemaProvider;
let connectionsProvider: ConnectionsProvider;
let historyProvider: HistoryProvider;
let hoverProvider: HoverProvider;
let codeLensProvider: CodeLensProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Live Database Playground is now active!');

    // Initialize core services
    databaseManager = new DatabaseManager(context);
    queryExecutor = new QueryExecutor(databaseManager);
    aiGenerator = new AIQueryGenerator(context);
    resultsPanel = ResultsPanel.createOrShow(context.extensionUri);
    schemaProvider = new SchemaProvider(databaseManager);
    connectionsProvider = new ConnectionsProvider(databaseManager);
    historyProvider = new HistoryProvider(context);
    hoverProvider = new HoverProvider(queryExecutor, aiGenerator);
    codeLensProvider = new CodeLensProvider(queryExecutor);

    // Register commands
    const connectCommand = vscode.commands.registerCommand('liveDB.connectDatabase', async () => {
        await databaseManager.showConnectionDialog();
    });

    const runQueryCommand = vscode.commands.registerCommand('liveDB.runQuery', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.document.getText(editor.selection);
        const line = editor.document.lineAt(editor.selection.active.line).text;
        
        let query = selection;
        if (!query.trim()) {
            // Extract query from comment if no selection
            const commentMatch = line.match(/\/\/\s*db:\s*(.+)/);
            if (commentMatch) {
                query = commentMatch[1].trim();
            } else {
                query = line.trim();
            }
        }

        if (!query) {
            vscode.window.showErrorMessage('No query found to execute');
            return;
        }

        try {
            const results = await queryExecutor.executeQuery(query);
            await resultsPanel.showResults(results);
            await historyProvider.addQuery(query, results);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Query execution failed: ${errorMessage}`);
        }
    });

    const generateQueryCommand = vscode.commands.registerCommand('liveDB.generateQuery', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const line = editor.document.lineAt(editor.selection.active.line).text;
        const commentMatch = line.match(/\/\/\s*db:\s*(.+)/);
        
        if (!commentMatch) {
            vscode.window.showErrorMessage('No database comment found. Use format: // db: your natural language query');
            return;
        }

        const naturalLanguageQuery = commentMatch[1].trim();
        
        try {
            const generatedQuery = await aiGenerator.generateQuery(naturalLanguageQuery);
            
            // Insert the generated query below the comment
            const position = editor.selection.active;
            const insertPosition = new vscode.Position(position.line + 1, 0);
            
            await editor.edit(editBuilder => {
                editBuilder.insert(insertPosition, generatedQuery + '\n');
            });

            vscode.window.showInformationMessage('Query generated successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Query generation failed: ${errorMessage}`);
        }
    });

    const showResultsCommand = vscode.commands.registerCommand('liveDB.showResults', () => {
        resultsPanel.show();
    });

    const showSchemaCommand = vscode.commands.registerCommand('liveDB.showSchema', async () => {
        await schemaProvider.refresh();
    });

    const saveConnectionCommand = vscode.commands.registerCommand('liveDB.saveConnection', async () => {
        await databaseManager.saveCurrentConnection();
    });

    const loadConnectionCommand = vscode.commands.registerCommand('liveDB.loadConnection', async () => {
        await databaseManager.loadSavedConnection();
    });

    // Register providers
    const hoverDisposable = vscode.languages.registerHoverProvider(
        ['sql', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        hoverProvider
    );

    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        ['sql', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        codeLensProvider
    );

    // Register tree data providers
    vscode.window.registerTreeDataProvider('liveDB.connections', connectionsProvider);
    vscode.window.registerTreeDataProvider('liveDB.schema', schemaProvider);
    vscode.window.registerTreeDataProvider('liveDB.history', historyProvider);

    // Add all disposables to context
    context.subscriptions.push(
        connectCommand,
        runQueryCommand,
        generateQueryCommand,
        showResultsCommand,
        showSchemaCommand,
        saveConnectionCommand,
        loadConnectionCommand,
        hoverDisposable,
        codeLensDisposable
    );

    // Auto-connect if enabled
    const config = vscode.workspace.getConfiguration('liveDB');
    if (config.get('autoConnect')) {
        databaseManager.autoConnect();
    }

    // Show welcome message
    vscode.window.showInformationMessage(
        'Live Database Playground activated! Use Ctrl+Shift+Q to run queries, Ctrl+Shift+G to generate queries from comments.'
    );
}

export function deactivate() {
    if (databaseManager) {
        databaseManager.disconnectAll();
    }
}
