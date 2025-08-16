import mysql from 'mysql2/promise';
import { DatabaseConnection, QueryResult, SchemaInfo, TableInfo, ColumnInfo } from './DatabaseConnection';
import { ConnectionConfig } from '../DatabaseManager';

export class MySQLConnection extends DatabaseConnection {
    private connection: mysql.Connection | null = null;

    constructor(config: ConnectionConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        this.connection = await mysql.createConnection({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined
        });

        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
        this.connected = false;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.connection || !this.connected) {
            throw new Error('Not connected to database');
        }

        const startTime = Date.now();
        const [rows, fields] = await this.connection.execute(query);
        const executionTime = Date.now() - startTime;

        return {
            columns: fields.map(field => field.name),
            rows: rows as any[],
            rowCount: Array.isArray(rows) ? rows.length : 0,
            executionTime
        };
    }

    async getSchema(): Promise<SchemaInfo> {
        if (!this.connection || !this.connected) {
            throw new Error('Not connected to database');
        }

        const query = `
            SELECT 
                t.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable,
                CASE WHEN k.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            LEFT JOIN information_schema.key_column_usage k ON 
                t.table_name = k.table_name AND 
                c.column_name = k.column_name AND 
                k.constraint_name = 'PRIMARY'
            WHERE t.table_schema = ?
            ORDER BY t.table_name, c.ordinal_position
        `;

        const [rows] = await this.connection.execute(query, [this.config.database]);
        
        const tablesMap = new Map<string, TableInfo>();
        
        for (const row of rows as any[]) {
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
        return this.connected && this.connection !== null;
    }
}
