import * as vscode from 'vscode';
import { PostgreSQLConnection } from './connections/PostgreSQLConnection';
import { MySQLConnection } from './connections/MySQLConnection';
import { SQLServerConnection } from './connections/SQLServerConnection';
import { MongoDBConnection } from './connections/MongoDBConnection';
import { DatabaseConnection } from './connections/DatabaseConnection';

export interface ConnectionConfig {
    id: string;
    name: string;
    type: 'postgresql' | 'mysql' | 'sqlserver' | 'mongodb';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
}

export class DatabaseManager {
    private connections: Map<string, DatabaseConnection> = new Map();
    private currentConnection: DatabaseConnection | null = null;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async showConnectionDialog(): Promise<void> {
        const connectionType = await vscode.window.showQuickPick(
            ['PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB'],
            { placeHolder: 'Select database type' }
        );

        if (!connectionType) return;

        const name = await vscode.window.showInputBox({
            prompt: 'Connection name',
            placeHolder: 'My Database'
        });

        if (!name) return;

        const host = await vscode.window.showInputBox({
            prompt: 'Host',
            placeHolder: 'localhost',
            value: 'localhost'
        });

        if (!host) return;

        const portStr = await vscode.window.showInputBox({
            prompt: 'Port',
            placeHolder: this.getDefaultPort(connectionType),
            value: this.getDefaultPort(connectionType)
        });

        if (!portStr) return;

        const port = parseInt(portStr);
        const database = await vscode.window.showInputBox({
            prompt: 'Database name',
            placeHolder: 'mydb'
        });

        if (!database) return;

        const username = await vscode.window.showInputBox({
            prompt: 'Username',
            placeHolder: 'postgres'
        });

        if (!username) return;

        const password = await vscode.window.showInputBox({
            prompt: 'Password',
            password: true
        });

        if (!password) return;

        const config: ConnectionConfig = {
            id: this.generateId(),
            name,
            type: this.mapConnectionType(connectionType),
            host,
            port,
            database,
            username,
            password,
            ssl: false
        };

        await this.connect(config);
    }

    async connect(config: ConnectionConfig): Promise<void> {
        try {
            let connection: DatabaseConnection;

            switch (config.type) {
                case 'postgresql':
                    connection = new PostgreSQLConnection(config);
                    break;
                case 'mysql':
                    connection = new MySQLConnection(config);
                    break;
                case 'sqlserver':
                    connection = new SQLServerConnection(config);
                    break;
                case 'mongodb':
                    connection = new MongoDBConnection(config);
                    break;
                default:
                    throw new Error(`Unsupported database type: ${config.type}`);
            }

            await connection.connect();
            this.connections.set(config.id, connection);
            this.currentConnection = connection;

            // Save connection to secrets
            await this.saveConnection(config);

            vscode.window.showInformationMessage(`Connected to ${config.name} successfully!`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Connection failed: ${errorMessage}`);
            throw error;
        }
    }

    async disconnect(connectionId: string): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (connection) {
            await connection.disconnect();
            this.connections.delete(connectionId);
            
            if (this.currentConnection === connection) {
                this.currentConnection = null;
            }
        }
    }

    disconnectAll(): void {
        this.connections.forEach(connection => {
            connection.disconnect();
        });
        this.connections.clear();
        this.currentConnection = null;
    }

    getCurrentConnection(): DatabaseConnection | null {
        return this.currentConnection;
    }

    async saveConnection(config: ConnectionConfig): Promise<void> {
        const connections = await this.getSavedConnections();
        connections[config.id] = config;
        
        await this.context.secrets.store('liveDB.connections', JSON.stringify(connections));
    }

    async getSavedConnections(): Promise<Record<string, ConnectionConfig>> {
        const connectionsStr = await this.context.secrets.get('liveDB.connections');
        return connectionsStr ? JSON.parse(connectionsStr) : {};
    }

    async loadSavedConnection(): Promise<void> {
        const connections = await this.getSavedConnections();
        const connectionNames = Object.values(connections).map(c => c.name);
        
        const selectedName = await vscode.window.showQuickPick(connectionNames, {
            placeHolder: 'Select saved connection'
        });

        if (!selectedName) return;

        const config = Object.values(connections).find(c => c.name === selectedName);
        if (config) {
            await this.connect(config);
        }
    }

    async saveCurrentConnection(): Promise<void> {
        if (!this.currentConnection) {
            vscode.window.showErrorMessage('No active connection to save');
            return;
        }

        const config = this.currentConnection.getConfig();
        await this.saveConnection(config);
        vscode.window.showInformationMessage('Connection saved successfully!');
    }

    async autoConnect(): Promise<void> {
        const connections = await this.getSavedConnections();
        const defaultConnection = Object.values(connections)[0];
        
        if (defaultConnection) {
            try {
                await this.connect(defaultConnection);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.log('Auto-connect failed:', errorMessage);
            }
        }
    }

    private getDefaultPort(connectionType: string): string {
        switch (connectionType) {
            case 'PostgreSQL': return '5432';
            case 'MySQL': return '3306';
            case 'SQL Server': return '1433';
            case 'MongoDB': return '27017';
            default: return '5432';
        }
    }

    private mapConnectionType(connectionType: string): ConnectionConfig['type'] {
        switch (connectionType) {
            case 'PostgreSQL': return 'postgresql';
            case 'MySQL': return 'mysql';
            case 'SQL Server': return 'sqlserver';
            case 'MongoDB': return 'mongodb';
            default: return 'postgresql';
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
