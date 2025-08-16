import { DatabaseManager } from './DatabaseManager';
import { QueryResult } from './connections/DatabaseConnection';

export class QueryExecutor {
    private databaseManager: DatabaseManager;

    constructor(databaseManager: DatabaseManager) {
        this.databaseManager = databaseManager;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        const connection = this.databaseManager.getCurrentConnection();
        if (!connection) {
            throw new Error('No database connection. Please connect to a database first.');
        }

        if (!connection.isConnected()) {
            throw new Error('Database connection is not active. Please reconnect.');
        }

        try {
            return await connection.executeQuery(query);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Query execution failed: ${errorMessage}`);
        }
    }

    async getSchema(): Promise<any> {
        const connection = this.databaseManager.getCurrentConnection();
        if (!connection) {
            throw new Error('No database connection. Please connect to a database first.');
        }

        if (!connection.isConnected()) {
            throw new Error('Database connection is not active. Please reconnect.');
        }

        try {
            return await connection.getSchema();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Schema retrieval failed: ${errorMessage}`);
        }
    }

    async getTableNames(): Promise<string[]> {
        try {
            const schema = await this.getSchema();
            return schema.tables.map((table: any) => table.name);
        } catch (error) {
            return [];
        }
    }

    async getColumnNames(tableName: string): Promise<string[]> {
        try {
            const schema = await this.getSchema();
            const table = schema.tables.find((t: any) => t.name === tableName);
            return table ? table.columns.map((col: any) => col.name) : [];
        } catch (error) {
            return [];
        }
    }

    async getColumnInfo(tableName: string, columnName: string): Promise<any> {
        try {
            const schema = await this.getSchema();
            const table = schema.tables.find((t: any) => t.name === tableName);
            if (!table) return null;

            const column = table.columns.find((col: any) => col.name === columnName);
            return column || null;
        } catch (error) {
            return null;
        }
    }

    isConnected(): boolean {
        const connection = this.databaseManager.getCurrentConnection();
        return connection ? connection.isConnected() : false;
    }

    getCurrentDatabaseType(): string | null {
        const connection = this.databaseManager.getCurrentConnection();
        return connection ? connection.getDatabaseType() : null;
    }

    getCurrentConnectionName(): string | null {
        const connection = this.databaseManager.getCurrentConnection();
        return connection ? connection.getConnectionName() : null;
    }
}
