import * as vscode from 'vscode';
import { QueryResult } from '../database/connections/DatabaseConnection';

interface HistoryEntry {
    id: string;
    query: string;
    timestamp: Date;
    results: QueryResult;
}

export class HistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | null | void> = new vscode.EventEmitter<HistoryItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<HistoryItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private history: HistoryEntry[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadHistory();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HistoryItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: HistoryItem): Thenable<HistoryItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.getHistoryItems());
        }
    }

    async addQuery(query: string, results: QueryResult): Promise<void> {
        const entry: HistoryEntry = {
            id: this.generateId(),
            query,
            timestamp: new Date(),
            results
        };

        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        await this.saveHistory();
        this.refresh();
    }

    async clearHistory(): Promise<void> {
        this.history = [];
        await this.saveHistory();
        this.refresh();
    }

    private getHistoryItems(): HistoryItem[] {
        if (this.history.length === 0) {
            return [new HistoryItem('No query history', 'empty')];
        }

        return this.history.map(entry => new HistoryItem(entry.query, 'query', entry));
    }

    private async loadHistory(): Promise<void> {
        try {
            const historyStr = await this.context.globalState.get('liveDB.history', '[]');
            const historyData = JSON.parse(historyStr);
            
            this.history = historyData.map((entry: any) => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
            }));
        } catch (error) {
            this.history = [];
        }
    }

    private async saveHistory(): Promise<void> {
        try {
            await this.context.globalState.update('liveDB.history', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

export class HistoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly type: 'query' | 'empty',
        public readonly entry?: HistoryEntry
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = type;

        if (type === 'query' && entry) {
            this.command = {
                command: 'liveDB.showHistoryResult',
                title: 'Show Results',
                arguments: [entry]
            };
        }
    }

    private getTooltip(): string {
        if (this.type === 'query' && this.entry) {
            return `${this.entry.query}\n\nExecuted: ${this.entry.timestamp.toLocaleString()}\nRows: ${this.entry.results.rowCount}`;
        }
        return this.label;
    }

    private getDescription(): string {
        if (this.type === 'query' && this.entry) {
            const timeAgo = this.getTimeAgo(this.entry.timestamp);
            return `${timeAgo} • ${this.entry.results.rowCount} rows`;
        }
        return '';
    }

    private getIcon(): vscode.ThemeIcon {
        switch (this.type) {
            case 'query':
                return new vscode.ThemeIcon('history');
            case 'empty':
                return new vscode.ThemeIcon('info');
            default:
                return new vscode.ThemeIcon('symbol-misc');
        }
    }

    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }
}
