import * as vscode from 'vscode';
import { DatabaseManager } from '../database/DatabaseManager';

export class SchemaProvider implements vscode.TreeDataProvider<SchemaItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SchemaItem | undefined | null | void> = new vscode.EventEmitter<SchemaItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SchemaItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private databaseManager: DatabaseManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SchemaItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SchemaItem): Thenable<SchemaItem[]> {
        if (element) {
            return element.getChildren();
        } else {
            return this.getTables();
        }
    }

    private async getTables(): Promise<SchemaItem[]> {
        try {
            const connection = this.databaseManager.getCurrentConnection();
            if (!connection || !connection.isConnected()) {
                return [new SchemaItem('Not connected to database', 'error')];
            }

            const schema = await connection.getSchema();
            return schema.tables.map(table => new SchemaItem(table.name, 'table', table));
        } catch (error) {
            return [new SchemaItem('Error loading schema', 'error')];
        }
    }
}

export class SchemaItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly type: 'table' | 'column' | 'error',
        public readonly tableData?: any
    ) {
        super(
            label,
            type === 'table' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = type;
    }

    async getChildren(): Promise<SchemaItem[]> {
        if (this.type === 'table' && this.tableData) {
            return this.tableData.columns.map((col: any) => 
                new SchemaItem(col.name, 'column', col)
            );
        }
        return [];
    }

    private getTooltip(): string {
        if (this.type === 'table') {
            return `Table: ${this.label}`;
        } else if (this.type === 'column' && this.tableData) {
            const col = this.tableData;
            return `${col.name} (${col.type})${col.nullable ? ' - nullable' : ' - not null'}${col.primaryKey ? ' - primary key' : ''}`;
        }
        return this.label;
    }

    private getDescription(): string {
        if (this.type === 'column' && this.tableData) {
            const col = this.tableData;
            let desc = col.type;
            if (col.primaryKey) desc += ' (PK)';
            if (!col.nullable) desc += ' NOT NULL';
            return desc;
        }
        return '';
    }

    private getIcon(): vscode.ThemeIcon {
        switch (this.type) {
            case 'table':
                return new vscode.ThemeIcon('table');
            case 'column':
                return new vscode.ThemeIcon('symbol-field');
            case 'error':
                return new vscode.ThemeIcon('error');
            default:
                return new vscode.ThemeIcon('symbol-misc');
        }
    }
}
