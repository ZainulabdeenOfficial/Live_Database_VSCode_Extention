-- Live Database Playground Sample Queries
-- This file demonstrates the various features of the extension

-- 1. Natural Language Query Generation
-- db: get all users with age greater than 25
-- Press Ctrl+Shift+G to generate SQL from this comment

-- 2. Direct SQL Execution
-- Press Ctrl+Shift+Q to run this query
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at
FROM users u
WHERE u.status = 'active'
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Complex Query Example
-- db: find users who have placed more than 5 orders in the last 30 days
-- Press Ctrl+Shift+G to generate this complex query

-- 4. MongoDB Query Example (for MongoDB connections)
-- db: find all products with price greater than 100
-- This will generate: db.products.find({ price: { $gt: 100 } })

-- 5. Aggregation Example
-- db: get total sales by month for the current year

-- 6. Join Query Example
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

-- 7. Schema Exploration
-- Use the Database Schema panel to explore table structures
-- Hover over table names for quick info

-- 8. Query History
-- All executed queries are automatically saved
-- Check the Query History panel to see previous queries

-- Tips:
-- - Use Ctrl+Shift+Q to run any query
-- - Use Ctrl+Shift+G to generate SQL from natural language
-- - Hover over queries for quick information
-- - Check the sidebar for connections, schema, and history
-- - Results are displayed in a beautiful, sortable table
