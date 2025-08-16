import sql from 'mssql';
import { DatabaseConnection, QueryResult, SchemaInfo, TableInfo, ColumnInfo } from './DatabaseConnection';
import { ConnectionConfig } from '../DatabaseManager';

export class SQLServerConnection extends DatabaseConnection {
    private pool: sql.ConnectionPool | null = null;

    constructor(config: ConnectionConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        const config: sql.config = {
            server: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            options: {
                encrypt: this.config.ssl,
                trustServerCertificate: true
            }
        };

        this.pool = await sql.connect(config);
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
        this.connected = false;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.pool || !this.connected) {
            throw new Error('Not connected to database');
        }

        const startTime = Date.now();
        const result = await this.pool.request().query(query);
        const executionTime = Date.now() - startTime;

        return {
            columns: Object.keys(result.recordset.columns),
            rows: result.recordset,
            rowCount: result.rowsAffected[0],
            executionTime
        };
    }

    async getSchema(): Promise<SchemaInfo> {
        if (!this.pool || !this.connected) {
            throw new Error('Not connected to database');
        }

        const query = `
            SELECT 
                t.name as table_name,
                c.name as column_name,
                ty.name as data_type,
                c.is_nullable,
                CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key
            FROM sys.tables t
            JOIN sys.columns c ON t.object_id = c.object_id
            JOIN sys.types ty ON c.user_type_id = ty.user_type_id
            LEFT JOIN (
                SELECT ic.object_id, ic.column_id
                FROM sys.index_columns ic
                JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
                WHERE i.is_primary_key = 1
            ) pk ON t.object_id = pk.object_id AND c.column_id = pk.column_id
            ORDER BY t.name, c.column_id
        `;

        const result = await this.pool.request().query(query);
        
        const tablesMap = new Map<string, TableInfo>();
        
        for (const row of result.recordset) {
            const tableName = row.table_name;
            const column: ColumnInfo = {
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable,
                primaryKey: row.is_primary_key === 1
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
        return this.connected && this.pool !== null;
    }
}
