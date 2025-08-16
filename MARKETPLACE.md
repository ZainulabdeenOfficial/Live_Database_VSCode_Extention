# Live Database Playground - VS Code Marketplace Listing

## 🎯 Overview

**Live Database Playground** transforms your VS Code editor into a powerful, AI-enhanced database playground. Write natural language queries, execute them instantly, and explore your database schema with intelligent assistance.

## ✨ Key Features

### 🔌 Multi-Database Support
- **PostgreSQL** - Full schema introspection and query execution
- **MySQL** - Complete integration with advanced features
- **SQL Server** - T-SQL support with connection pooling
- **MongoDB** - Document database queries and aggregation

### 🤖 AI-Powered Query Generation
Transform natural language into perfect database queries:
```javascript
// db: get all users with age greater than 25
// Press Ctrl+Shift+G → SELECT * FROM users WHERE age > 25
```

### ⚡ Instant Query Execution
Execute queries directly from your code with beautiful results:
```sql
SELECT * FROM users WHERE status = 'active';
-- Press Ctrl+Shift+Q for instant results
```

### 🎯 Smart IntelliSense
- Schema-aware autocomplete for tables and columns
- Real-time connection status
- Database-specific syntax highlighting

### 📊 Beautiful Results Display
- Sortable data tables with pagination
- Execution time tracking
- Export capabilities
- Modern VS Code-themed UI

## 🚀 Quick Start

1. **Install** the extension from VS Code marketplace
2. **Connect** to your database: `Ctrl+Shift+P` → "Live DB: Connect"
3. **Write** natural language: `// db: get all users`
4. **Generate** SQL: Press `Ctrl+Shift+G`
5. **Execute** query: Press `Ctrl+Shift+Q`

## 🎮 Usage Examples

### Natural Language Queries
```javascript
// db: find all active users who signed up in the last 30 days
// db: count total orders by customer
// db: get the top 10 products by sales
// db: analyze user behavior patterns
```

### Direct SQL Execution
```sql
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name
ORDER BY order_count DESC;
```

### MongoDB Queries
```javascript
// db: find all users with age greater than 25
db.users.find({ age: { $gt: 25 } })

// db: aggregate orders by month
db.orders.aggregate([
  { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } }
])
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Q` | Run selected query or query on current line |
| `Ctrl+Shift+G` | Generate SQL from natural language comment |
| `Ctrl+Shift+R` | Show results panel |
| `Ctrl+Shift+P` → "Live DB: Connect" | Connect to database |

## 🎨 UI Components

### Activity Bar Integration
- **Database Connections** - View and manage saved connections
- **Query Results** - Browse recent query results with sorting
- **Database Schema** - Explore table structures and relationships
- **Query History** - Access and re-execute previous queries

### Inline Features
- **Hover Information** - Hover over queries for quick info
- **Code Lenses** - Clickable actions above queries
- **IntelliSense** - Smart autocomplete for database objects

## 🔧 Advanced Features

### Connection Management
- Secure credential storage using VS Code Secrets API
- Multiple saved connections with easy switching
- Auto-connect on startup
- Connection health monitoring

### AI Integration
- OpenAI GPT-3.5-turbo for intelligent query generation
- Rule-based fallback for offline usage
- Database-specific prompt engineering
- Natural language understanding

### Query Optimization
- Execution time tracking
- Query plan analysis (PostgreSQL)
- Performance insights and suggestions

## 🛠️ Configuration

### Database Connections
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Live DB: Connect to Database"
3. Follow the intuitive connection wizard
4. Save connections for future use

### AI Query Generation
1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Open VS Code Settings (`Ctrl+,`)
3. Search for "Live Database Playground"
4. Enter your API key in `liveDB.openaiApiKey`

## 🎯 Perfect For

- **Developers** who want to explore databases without leaving their editor
- **Data Analysts** who need quick query execution and results
- **Full-Stack Developers** working with multiple database types
- **DevOps Engineers** who need database management tools
- **Students** learning SQL and database concepts

## 🔄 What's New

### Version 0.1.0
- ✨ Initial release with multi-database support
- 🤖 AI-powered query generation
- 📊 Beautiful results display
- 🔌 Secure connection management
- 🎯 Schema-aware IntelliSense
- 📝 Query history tracking

## 🐛 Troubleshooting

### Connection Issues
- Verify database server is running
- Check firewall settings
- Ensure correct credentials
- Try SSL connection if needed

### AI Generation Issues
- Verify OpenAI API key is set
- Check internet connection
- Ensure sufficient API credits
- Try rule-based generation as fallback

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/live-database-playground/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/live-database-playground/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/live-database-playground/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the developer community**

*Transform your coding experience with the power of AI and databases!*
