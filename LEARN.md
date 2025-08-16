A comprehensive guide to Live Database VS Code Extension – from installation to publishing.

Goal: Provide a live “playground” inside VS Code to connect to databases, run queries, preview results, and iterate faster while building apps.

Table of Contents

What is this extension?

Key features

Supported databases

Architecture overview

Installation (Users)

Quick start

Settings & Configuration

Commands (Command Palette)

Connections & Security

Query Editor & Result Viewer

Snippets & Templates

Logs & Troubleshooting

Development (Contributors)

Testing

Packaging & Publishing

Versioning & Releases

FAQ

Contributing

Code of Conduct

License

What is this extension?

Live Database adds a lightweight database client to VS Code. It lets you:

Create/manage connections

Run queries with syntax highlighting

See results in a grid view

Export results to CSV/JSON

Save favorite queries and snippets

It’s ideal for learners, backend developers, and data explorers who want to stay inside VS Code without switching tools.

Key features

Connections Panel: Add, edit, delete database connections.

Secure storage: Passwords/keys stored via VS Code’s SecretStorage.

Query Editor: SQL editing with IntelliSense (where supported by language mode).

Results Grid: Sort, filter, copy, export.

Query History: Quickly re-run previous queries.

Snippets: Common CRUD/DDL templates.

Multiple DB Engines: Work with popular relational databases.

Status Bar: Shows active connection and latency.

Supported databases

Out of the box, the extension is designed to support the following (depending on drivers included in the repo):

MySQL / MariaDB

PostgreSQL

SQLite (no server needed)

Microsoft SQL Server

If your current build includes only a subset, update this list accordingly and mark others as Planned.

Architecture overview

VS Code (UI) ─┬─ SideBar: Connections Tree
               ├─ Webview: Query/Results
               ├─ StatusBar: Active Connection
               └─ Commands (extension.ts)

Extension Host ──> DB Client Layer (drivers)
                 └─ Secret Storage (credentials)

DB Server(s) <──> Node DB Drivers (pg, mysql2, mssql, sqlite3)

extension.ts: Activates extension, registers views/commands.

src/clients/*: Thin wrappers over DB drivers.

src/views/*: Webview UI for editor/results.

src/store/*: Connection profiles, history, and secrets.

Installation (Users)

Install Visual Studio Code (latest).

Open VS Code → Extensions (Ctrl/Cmd+Shift+X) → search Live Database → Install.

Alternatively, download the .vsix from Releases and install via:

code --install-extension live-database-<version>.vsix

Quick start

Open the Live Database view: Ctrl/Cmd+Shift+P → Live DB: Open.

Create a connection: Click Add Connection → select engine → fill host, port, user, database.

Connect: The status bar shows the active connection.

Run a query: Open a new Live DB Query editor, type SQL, press Run or Ctrl/Cmd+Enter.

View results: See the grid; right‑click to export rows to CSV/JSON.

Settings & Configuration

User/workspace settings (search for Live Database in Settings):

liveDB.defaultEngine: Default database engine.

liveDB.autosaveConnections: Persist connections in workspace.

liveDB.savePasswords: Store credentials in SecretStorage.

liveDB.maxRows: Row limit per query (e.g., 5,000).

liveDB.queryTimeoutMs: Timeout for long‑running queries.

liveDB.telemetry: Enable/disable anonymous usage metrics.

Workspace settings override user settings for that project.

Commands (Command Palette)

Live DB: Open – opens the main panel.

Live DB: New Connection – wizard for creating a connection.

Live DB: Disconnect – closes the current connection.

Live DB: New Query – opens a new query editor.

Live DB: Run Query – executes current query.

Live DB: Show History – shows recently executed queries.

Live DB: Export Result – export grid to CSV/JSON.

Connections & Security

Credentials: Stored with VS Code SecretStorage (encrypted at rest).

Environment Variables: You can set LIVE_DB_URL / LIVE_DB_PG_URL etc. to prefill connections.

SSH Tunnels: If needed, use your system’s SSH tunnel and connect via localhost.

Read‑only Mode: Optionally enforce read-only queries for production.

Query Editor & Result Viewer

Multi‑tab query editors per connection.

Parameterized queries (e.g., :id) with a small variables panel.

Grid actions: copy cell, copy row, copy column, export, resize columns, toggle wrapping.

Error diagnostics show driver error messages and query timing.

Snippets & Templates

Common snippets (trigger → expands):

sel* → SELECT * FROM table LIMIT 100;

ctab → CREATE TABLE example (id INT PRIMARY KEY, ...);

ins → INSERT INTO table (col1, col2) VALUES (?, ?);

upd → UPDATE table SET col=? WHERE id=?;

del → DELETE FROM table WHERE id=?;

Customize snippets in snippets/live-db.code-snippets.

Logs & Troubleshooting

Output Panel → Live Database channel for extension logs.

Developer Tools → Console for webview errors.

Common issues:

ECONNREFUSED: Verify host/port and firewall rules.

Authentication failed: Check user/password and DB grants.

Timeouts: Increase liveDB.queryTimeoutMs or test network latency.

SSL errors: Provide proper CA/SSL options if your DB requires TLS.

Development (Contributors)

Prerequisites

Node.js LTS

VS Code

Yarn or npm

Setup

git clone https://github.com/ZainulabdeenOfficial/Live_Database_VSCode_Extention.git
cd Live_Database_VSCode_Extention
npm install     # or: yarn
npm run build   # compiles TypeScript
npm run watch   # incremental build during development

Launch in VS Code

Press F5 to start the Extension Development Host.

Run the Live DB: Open command from the palette.

Folder Structure (suggested)

.
├── package.json
├── README.md
├── LEARN.md
├── LICENSE.md
├── src
│   ├── extension.ts
│   ├── clients
│   │   ├── mysqlClient.ts
│   │   ├── pgClient.ts
│   │   ├── mssqlClient.ts
│   │   └── sqliteClient.ts
│   ├── views
│   │   ├── panel.ts
│   │   └── webview
│   │       ├── index.html
│   │       ├── main.ts
│   │       └── styles.css
│   └── store
│       ├── connections.ts
│       └── history.ts
├── media
│   ├── icon.png
│   └── banner.png
├── snippets
│   └── live-db.code-snippets
├── out (build output)
└── vsc-extension-quickstart.md

Testing

Unit tests with vitest or mocha.

Integration tests using a local Docker DB (e.g., Postgres) launched in CI.

npm test

Packaging & Publishing

You need a Publisher in the VS Code Marketplace and the vsce tool.

Login

npm install -g vsce
vsce login <your_publisher>

Package

vsce package

This creates live-database-<version>.vsix.

Publish

vsce publish patch   # or: minor / major

Marketplace assets in package.json:

displayName, description, publisher, icon, categories, galleryBanner, repository

activationEvents, contributes.views, contributes.commands, contributes.configuration, engines.vscode

Versioning & Releases

Use Semantic Versioning: MAJOR.MINOR.PATCH.

Release checklist



FAQ

Q: Does it store my passwords?A: Only if you enable liveDB.savePasswords. They’re stored via SecretStorage.

Q: Can I execute multiple statements?A: Yes; the editor splits on semicolons and runs sequentially (driver‑dependent).

Q: Where are my connections saved?A: In your user settings or workspace storage, depending on autosaveConnections.

Q: How do I export results?A: Right‑click the results grid → Export CSV/JSON.

Contributing

Contributions are welcome! Please:

Open an issue describing the change.

Fork the repo and create a feature branch.

Add tests where possible.

Submit a PR with a clear description and screenshots for UI changes.

Code of Conduct

This project follows a standard Contributor Covenant. Be respectful and collaborative.
