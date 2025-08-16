# 🎯 Live Database Playground

<div align="center">
  ### 🚀 **Transform Your VS Code into a Powerful Database Playground**
  
  *Advanced database playground with AI-powered query generation, inline results, and multi-database support*
  
  [![VS Code Version](https://img.shields.io/badge/VS%20Code-1.74.0+-blue.svg)](https://code.visualstudio.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
  [![Database Support](https://img.shields.io/badge/Databases-4%20Supported-brightgreen.svg)](#-multi-database-support)
</div>

## 🚀 Features

### 🔌 Multi-Database Support

### 💡 AI-Powered Query Generation
Write natural language comments and let AI generate the perfect query:

```javascript
// db: get all users with age greater than 25
// Press Ctrl+Shift+G to generate: SELECT * FROM users WHERE age > 25
```

### ⚡ Inline Query Execution
Execute queries directly from your code with instant results:

```sql
SELECT * FROM users WHERE status = 'active';
```

### 🎯 Smart IntelliSense

### 📊 Beautiful Results Display

### 🔄 Query History

## 🛠️ Installation

### From VSIX (Recommended)
1. Download the latest `.vsix` file from releases
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Choose the downloaded file

### From Source
```bash
git clone https://github.com/your-repo/live-database-playground
cd live-database-playground
npm install
npm run compile
```

## ⚙️ Configuration

### Database Connections
1. Open Command Palette (Ctrl+Shift+P)
2. Run "Live DB: Connect to Database"
3. Follow the connection wizard
4. Save connections for future use

### AI Query Generation
1. Get an OpenAI API key from [OpenAI](https://platform.openai.com/)
2. Open VS Code Settings (Ctrl+,)
3. Search for "Live Database Playground"
4. Enter your API key in `liveDB.openaiApiKey`

## 🎮 Usage

### Quick Start
1. **Connect to Database**: `Ctrl+Shift+P` → "Live DB: Connect to Database"
2. **Write a Query**: Add a comment like `// db: get all users`
3. **Generate SQL**: Press `Ctrl+Shift+G` to generate the query
4. **Execute Query**: Press `Ctrl+Shift+Q` to run and see results

### Natural Language Queries
```javascript
// db: find all active users who signed up in the last 30 days
// db: count total orders by customer
// db: get the top 10 products by sales
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

### Activity Bar

### Inline Features

## 🔧 Advanced Features

### Connection Management

### Query Optimization

### Export & Sharing

## 🐛 Troubleshooting

### Connection Issues
1. Verify database server is running
2. Check firewall settings
3. Ensure correct credentials
4. Try SSL connection if needed

### AI Generation Issues
1. Verify OpenAI API key is set
2. Check internet connection
3. Ensure sufficient API credits
4. Try rule-based generation as fallback

### Performance Issues
1. Limit result set size in settings
2. Use pagination for large datasets
3. Optimize queries before execution
4. Check database server performance

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-repo/live-database-playground
cd live-database-playground
npm install
npm run watch
```

### Testing
```bash
npm test
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments


## 📞 Support



**Made with ❤️ for the developer community**
