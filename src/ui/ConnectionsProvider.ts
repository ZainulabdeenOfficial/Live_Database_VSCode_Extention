import * as vscode from 'vscode';
import { DatabaseManager, ConnectionConfig } from '../database/DatabaseManager';

export class ConnectionsProvider implements vscode.TreeDataProvider<ConnectionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ConnectionItem | undefined | null | void> = new vscode.EventEmitter<ConnectionItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ConnectionItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private databaseManager: DatabaseManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ConnectionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConnectionItem): Thenable<ConnectionItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return this.getConnections();
        }
    }

    private async getConnections(): Promise<ConnectionItem[]> {
        try {
            const connections = await this.databaseManager.getSavedConnections();
            const items: ConnectionItem[] = [];

            for (const [id, config] of Object.entries(connections)) {
                const isConnected = this.databaseManager.getCurrentConnection()?.getConfig().id === id;
                items.push(new ConnectionItem(config, isConnected));
            }

            if (items.length === 0) {
                items.push(new ConnectionItem(null, false, 'No saved connections'));
            }

            return items;
        } catch (error) {
            return [new ConnectionItem(null, false, 'Error loading connections')];
        }
    }
}

export class ConnectionItem extends vscode.TreeItem {
    constructor(
        public readonly config: ConnectionConfig | null,
        public readonly isConnected: boolean,
        public readonly label?: string
    ) {
        super(
            label || (config ? `${config.name} (${config.type})` : 'Unknown'),
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = config ? `${config.host}:${config.port}/${config.database}` : '';
        this.description = config ? `${config.host}:${config.port}` : '';
        
        if (isConnected) {
            this.iconPath = new vscode.ThemeIcon('database', new vscode.ThemeColor('charts.green'));
            this.contextValue = 'connected';
        } else if (config) {
            this.iconPath = new vscode.ThemeIcon('database');
            this.contextValue = 'disconnected';
        } else {
            this.iconPath = new vscode.ThemeIcon('error');
            this.contextValue = 'error';
        }
    }
}
