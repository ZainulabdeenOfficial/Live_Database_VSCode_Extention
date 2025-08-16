import { ConnectionConfig } from '../DatabaseManager';

export interface QueryResult {
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTime: number;
}

export interface SchemaInfo {
    tables: TableInfo[];
}

export interface TableInfo {
    name: string;
    columns: ColumnInfo[];
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
}

export abstract class DatabaseConnection {
    protected config: ConnectionConfig;
    protected connected: boolean = false;

    constructor(config: ConnectionConfig) {
        this.config = config;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract executeQuery(query: string): Promise<QueryResult>;
    abstract getSchema(): Promise<SchemaInfo>;
    abstract isConnected(): boolean;

    getConfig(): ConnectionConfig {
        return this.config;
    }

    getConnectionName(): string {
        return this.config.name;
    }

    getDatabaseType(): string {
        return this.config.type;
    }
}
