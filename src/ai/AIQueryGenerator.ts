import * as vscode from 'vscode';
import OpenAI from 'openai';

export class AIQueryGenerator {
    private openai: OpenAI | null = null;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeOpenAI();
    }

    private initializeOpenAI(): void {
        const config = vscode.workspace.getConfiguration('liveDB');
        const apiKey = config.get('openaiApiKey') as string;
        
        if (apiKey) {
            this.openai = new OpenAI({
                apiKey: apiKey
            });
        }
    }

    async generateQuery(naturalLanguageQuery: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('liveDB');
        const aiProvider = config.get('aiProvider') as string;

        if (aiProvider === 'openai') {
            return await this.generateWithOpenAI(naturalLanguageQuery);
        } else {
            return await this.generateWithRules(naturalLanguageQuery);
        }
    }

    private async generateWithOpenAI(naturalLanguageQuery: string): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured. Please set liveDB.openaiApiKey in settings.');
        }

        try {
            const databaseType = await this.getCurrentDatabaseType();
            
            const systemPrompt = this.getSystemPrompt(databaseType);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `Generate a ${databaseType} query for: ${naturalLanguageQuery}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            });

            const generatedQuery = completion.choices[0]?.message?.content?.trim();
            
            if (!generatedQuery) {
                throw new Error('Failed to generate query');
            }

            return generatedQuery;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`OpenAI query generation failed: ${errorMessage}`);
        }
    }

    private async generateWithRules(naturalLanguageQuery: string): Promise<string> {
        // Rule-based query generation as fallback
        const query = naturalLanguageQuery.toLowerCase();
        const databaseType = await this.getCurrentDatabaseType();

        if (databaseType === 'mongodb') {
            return this.generateMongoQuery(query);
        } else {
            return this.generateSQLQuery(query);
        }
    }

    private generateSQLQuery(query: string): string {
        // Simple rule-based SQL generation
        if (query.includes('select') && query.includes('from')) {
            // Already looks like SQL
            return query;
        }

        if (query.includes('get all') || query.includes('find all')) {
            const tableMatch = query.match(/(?:get all|find all)\s+(\w+)/);
            if (tableMatch) {
                return `SELECT * FROM ${tableMatch[1]}`;
            }
        }

        if (query.includes('count')) {
            const tableMatch = query.match(/count\s+(\w+)/);
            if (tableMatch) {
                return `SELECT COUNT(*) FROM ${tableMatch[1]}`;
            }
        }

        if (query.includes('where')) {
            const parts = query.split('where');
            const tableMatch = parts[0].match(/(?:get|find|select)\s+(\w+)/);
            if (tableMatch) {
                return `SELECT * FROM ${tableMatch[1]} WHERE ${parts[1].trim()}`;
            }
        }

        // Default fallback
        return `SELECT * FROM table_name WHERE 1=1`;
    }

    private generateMongoQuery(query: string): string {
        // Simple rule-based MongoDB generation
        if (query.includes('db.') && query.includes('.find')) {
            // Already looks like MongoDB query
            return query;
        }

        if (query.includes('get all') || query.includes('find all')) {
            const collectionMatch = query.match(/(?:get all|find all)\s+(\w+)/);
            if (collectionMatch) {
                return `db.${collectionMatch[1]}.find({})`;
            }
        }

        if (query.includes('count')) {
            const collectionMatch = query.match(/count\s+(\w+)/);
            if (collectionMatch) {
                return `db.${collectionMatch[1]}.countDocuments({})`;
            }
        }

        if (query.includes('where')) {
            const parts = query.split('where');
            const collectionMatch = parts[0].match(/(?:get|find|select)\s+(\w+)/);
            if (collectionMatch) {
                // Simple condition parsing
                const condition = parts[1].trim();
                const filter = this.parseMongoCondition(condition);
                return `db.${collectionMatch[1]}.find(${JSON.stringify(filter)})`;
            }
        }

        // Default fallback
        return `db.collection_name.find({})`;
    }

    private parseMongoCondition(condition: string): any {
        // Simple condition parsing for MongoDB
        if (condition.includes('>')) {
            const [field, value] = condition.split('>').map(s => s.trim());
            return { [field]: { $gt: parseInt(value) || value } };
        }
        if (condition.includes('<')) {
            const [field, value] = condition.split('<').map(s => s.trim());
            return { [field]: { $lt: parseInt(value) || value } };
        }
        if (condition.includes('=')) {
            const [field, value] = condition.split('=').map(s => s.trim());
            return { [field]: parseInt(value) || value };
        }
        
        return {};
    }

    private async getCurrentDatabaseType(): Promise<string> {
        // This would ideally get the current database type from the connection
        // For now, return a default
        const config = vscode.workspace.getConfiguration('liveDB');
        return config.get('defaultDatabase') as string || 'postgresql';
    }

    private getSystemPrompt(databaseType: string): string {
        const prompts = {
            postgresql: `You are a PostgreSQL expert. Generate clean, efficient SQL queries. 
            Always use proper SQL syntax with semicolons. 
            Use table and column names that make sense for the given context.`,
            
            mysql: `You are a MySQL expert. Generate clean, efficient SQL queries. 
            Always use proper MySQL syntax with semicolons. 
            Use table and column names that make sense for the given context.`,
            
            sqlserver: `You are a SQL Server expert. Generate clean, efficient T-SQL queries. 
            Always use proper T-SQL syntax with semicolons. 
            Use table and column names that make sense for the given context.`,
            
            mongodb: `You are a MongoDB expert. Generate clean, efficient MongoDB queries. 
            Use proper MongoDB syntax with db.collection.find() or db.collection.aggregate(). 
            Use collection names that make sense for the given context.`
        };

        return prompts[databaseType as keyof typeof prompts] || prompts.postgresql;
    }

    async updateApiKey(apiKey: string): Promise<void> {
        await vscode.workspace.getConfiguration('liveDB').update('openaiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        this.initializeOpenAI();
    }
}
