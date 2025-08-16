// Live Database Playground - JavaScript/TypeScript Examples
// This file shows how the extension works with JS/TS files

// 1. Natural Language Query Generation
// db: get all users with age greater than 25
// Press Ctrl+Shift+G to generate SQL from this comment

// 2. Direct SQL Execution in Comments
// Press Ctrl+Shift+Q to run this query
/*
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at
FROM users u
WHERE u.status = 'active'
ORDER BY u.created_at DESC
LIMIT 10;
*/

// 3. MongoDB Query Examples
// db: find all products with price greater than 100
// This will generate: db.products.find({ price: { $gt: 100 } })

// 4. Complex Query Generation
// db: find users who have placed more than 5 orders in the last 30 days

// 5. Aggregation Example
// db: get total sales by month for the current year

// 6. Inline SQL in String Literals
const userQuery = `
SELECT 
    u.name as customer_name,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;
`;

// 7. MongoDB Query in String Literals
const mongoQuery = `
db.users.find({ 
    age: { $gt: 25 },
    status: 'active'
}).sort({ created_at: -1 }).limit(10)
`;

// 8. Function with Database Queries
function getUserStats() {
    // db: get user statistics for dashboard
    const statsQuery = `
    SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        AVG(age) as avg_age
    FROM users
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;
    
    return statsQuery;
}

// 9. API Route Example
app.get('/api/users', async (req, res) => {
    // db: get paginated users with search
    const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE name LIKE '%${req.query.search}%'
    ORDER BY created_at DESC
    LIMIT ${req.query.limit || 10}
    OFFSET ${req.query.offset || 0};
    `;
    
    // Execute query using the extension
    // Press Ctrl+Shift+Q on the query above
});

// 10. Data Analysis Example
function analyzeUserBehavior() {
    // db: analyze user behavior patterns
    const analysisQuery = `
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        AVG(orders_count) as avg_orders,
        SUM(total_spent) as total_revenue
    FROM users u
    LEFT JOIN (
        SELECT user_id, COUNT(*) as orders_count, SUM(amount) as total_spent
        FROM orders
        GROUP BY user_id
    ) o ON u.id = o.user_id
    WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
    `;
    
    return analysisQuery;
}

// Tips for JavaScript/TypeScript files:
// - Use // db: comments for natural language queries
// - Write SQL in multi-line comments or string literals
// - The extension detects queries in various contexts
// - Hover over queries for quick information
// - Use Ctrl+Shift+Q to run any detected query
// - Use Ctrl+Shift+G to generate SQL from natural language
