import { Client } from 'pg';
import { DatabaseConnection, QueryResult, SchemaInfo, TableInfo, ColumnInfo } from './DatabaseConnection';
import { ConnectionConfig } from '../DatabaseManager';

export class PostgreSQLConnection extends DatabaseConnection {
    private client: Client | null = null;

    constructor(config: ConnectionConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        this.client = new Client({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            ssl: this.config.ssl ? { rejectUnauthorized: false } : false
        });

        await this.client.connect();
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
        }
        this.connected = false;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.client || !this.connected) {
            throw new Error('Not connected to database');
        }

        const startTime = Date.now();
        const result = await this.client.query(query);
        const executionTime = Date.now() - startTime;

        return {
            columns: result.fields.map((field: any) => field.name),
            rows: result.rows,
            rowCount: result.rowCount || 0,
            executionTime
        };
    }

    async getSchema(): Promise<SchemaInfo> {
        if (!this.client || !this.connected) {
            throw new Error('Not connected to database');
        }

        const query = `
            SELECT 
                t.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable,
                CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            LEFT JOIN (
                SELECT ku.table_name, ku.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
            ) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
            WHERE t.table_schema = 'public'
            ORDER BY t.table_name, c.ordinal_position
        `;

        const result = await this.client.query(query);
        
        const tablesMap = new Map<string, TableInfo>();
        
        for (const row of result.rows) {
            const tableName = row.table_name;
            const column: ColumnInfo = {
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable === 'YES',
                primaryKey: row.is_primary_key
            };

            if (!tablesMap.has(tableName)) {
                tablesMap.set(tableName, {
                    name: tableName,
                    columns: []
                });
            }

            tablesMap.get(tableName)!.columns.push(column);
        }

        return {
            tables: Array.from(tablesMap.values())
        };
    }

    isConnected(): boolean {
        return this.connected && this.client !== null;
    }
}
