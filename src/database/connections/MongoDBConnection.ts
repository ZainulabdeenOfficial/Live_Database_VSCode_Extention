import { MongoClient, Db } from 'mongodb';
import { DatabaseConnection, QueryResult, SchemaInfo, TableInfo, ColumnInfo } from './DatabaseConnection';
import { ConnectionConfig } from '../DatabaseManager';

export class MongoDBConnection extends DatabaseConnection {
    private client: MongoClient | null = null;
    private db: Db | null = null;

    constructor(config: ConnectionConfig) {
        super(config);
    }

    async connect(): Promise<void> {
        const uri = `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        
        this.client = new MongoClient(uri, {
            ssl: this.config.ssl
        });

        await this.client.connect();
        this.db = this.client.db(this.config.database);
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
        this.connected = false;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.db || !this.connected) {
            throw new Error('Not connected to database');
        }

        const startTime = Date.now();
        
        try {
            // Parse MongoDB query (simplified - in real implementation, you'd want more robust parsing)
            const parsedQuery = this.parseMongoQuery(query);
            
            const collection = this.db.collection(parsedQuery.collection);
            const result = await collection.find(parsedQuery.filter).toArray();
            const executionTime = Date.now() - startTime;

            // Convert MongoDB documents to table format
            const columns = result.length > 0 ? Object.keys(result[0]) : [];
            const rows = result.map(doc => {
                const row: any = {};
                columns.forEach(col => {
                    row[col] = doc[col];
                });
                return row;
            });

            return {
                columns,
                rows,
                rowCount: result.length,
                executionTime
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`MongoDB query execution failed: ${errorMessage}`);
        }
    }

    async getSchema(): Promise<SchemaInfo> {
        if (!this.db || !this.connected) {
            throw new Error('Not connected to database');
        }

        const collections = await this.db.listCollections().toArray();
        const tables: TableInfo[] = [];

        for (const collection of collections) {
            const collectionName = collection.name;
            const sampleDocs = await this.db!.collection(collectionName).find().limit(10).toArray();
            
            // Analyze sample documents to infer schema
            const columns = this.inferColumnsFromDocuments(sampleDocs);
            
            tables.push({
                name: collectionName,
                columns
            });
        }

        return { tables };
    }

    isConnected(): boolean {
        return this.connected && this.client !== null && this.db !== null;
    }

    private parseMongoQuery(query: string): { collection: string; filter: any } {
        // Simple MongoDB query parser
        // Example: db.users.find({ age: { $gt: 25 } })
        const match = query.match(/db\.(\w+)\.find\((.+)\)/);
        if (!match) {
            throw new Error('Invalid MongoDB query format. Expected: db.collection.find(filter)');
        }

        const collection = match[1];
        const filterStr = match[2];
        
        let filter = {};
        try {
            filter = JSON.parse(filterStr);
        } catch {
            // If JSON parsing fails, try to create a simple filter
            filter = {};
        }

        return { collection, filter };
    }

    private inferColumnsFromDocuments(docs: any[]): ColumnInfo[] {
        if (docs.length === 0) {
            return [];
        }

        const allKeys = new Set<string>();
        docs.forEach(doc => {
            Object.keys(doc).forEach(key => allKeys.add(key));
        });

        return Array.from(allKeys).map(key => ({
            name: key,
            type: this.inferTypeFromValues(docs, key),
            nullable: true, // MongoDB fields are generally nullable
            primaryKey: key === '_id' // MongoDB _id is typically the primary key
        }));
    }

    private inferTypeFromValues(docs: any[], key: string): string {
        const values = docs.map(doc => doc[key]).filter(val => val !== undefined);
        
        if (values.length === 0) return 'unknown';
        
        const types = new Set(values.map(val => typeof val));
        
        if (types.has('object')) return 'object';
        if (types.has('string')) return 'string';
        if (types.has('number')) return 'number';
        if (types.has('boolean')) return 'boolean';
        
        return 'unknown';
    }
}
