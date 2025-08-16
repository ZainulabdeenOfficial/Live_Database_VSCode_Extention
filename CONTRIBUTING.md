# 🤝 Contributing to Live Database Playground

Thank you for your interest in contributing to **Live Database Playground**! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- VS Code
- Git

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/ZainulabdeenOfficial/Live_Database_VSCode_Extention.git
cd Live_Database_VSCode_Extention

# Install dependencies
npm install

# Compile the extension
npm run compile

# Start development mode
npm run watch
```

## 🎯 How to Contribute

### 1. Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally
3. Add the original repository as upstream

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the coding standards
- Add tests for new features
- Update documentation

### 4. Test Your Changes
```bash
# Run tests
npm test

# Lint code
npm run lint

# Compile
npm run compile
```

### 5. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the PR

## 📝 Code Standards

### TypeScript Guidelines
- Use TypeScript for all new code
- Follow strict typing
- Use interfaces for object shapes
- Prefer `const` over `let`
- Use arrow functions for callbacks

### Naming Conventions
- **Files:** kebab-case (e.g., `database-manager.ts`)
- **Classes:** PascalCase (e.g., `DatabaseManager`)
- **Functions:** camelCase (e.g., `connectDatabase`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RESULTS`)

### Code Style
```typescript
// Good
export class DatabaseManager {
    private connection: DatabaseConnection;
    
    public async connect(config: ConnectionConfig): Promise<void> {
        try {
            this.connection = await this.createConnection(config);
        } catch (error) {
            throw new Error(`Connection failed: ${error.message}`);
        }
    }
}

// Bad
export class databasemanager {
    private Connection: any;
    
    public async Connect(config: any): Promise<any> {
        this.Connection = await this.createConnection(config);
    }
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "DatabaseManager"
```

### Writing Tests
- Use Mocha for test framework
- Place tests in `src/test/` directory
- Name test files with `.test.ts` extension
- Test both success and error cases

Example test:
```typescript
import { expect } from 'chai';
import { DatabaseManager } from '../database/DatabaseManager';

describe('DatabaseManager', () => {
    let manager: DatabaseManager;

    beforeEach(() => {
        manager = new DatabaseManager();
    });

    it('should connect to database successfully', async () => {
        const config = {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'testuser',
            password: 'testpass'
        };

        await expect(manager.connect(config)).to.not.be.rejected;
    });
});
```

## 📚 Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Update inline code comments
- Update API documentation
- Keep CHANGELOG.md updated

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation up-to-date

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Try to reproduce the bug
3. Check if it's a known issue

### Bug Report Template
```markdown
**Bug Description**
Brief description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- VS Code Version: 
- Extension Version: 
- OS: 
- Database Type: 

**Additional Information**
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Before Submitting
1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
```markdown
**Feature Description**
Brief description of the feature

**Use Case**
Why this feature is needed

**Proposed Implementation**
How you think it should work

**Alternatives Considered**
Other approaches you considered

**Additional Information**
Mockups, examples, etc.
```

## 🔄 Pull Request Process

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No sensitive data in commits
- [ ] Commit messages follow conventions

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes

Examples:
```
feat(database): add MongoDB connection support
fix(ui): resolve results panel display issue
docs(readme): update installation instructions
```

## 🏷️ Release Process

### Version Bumping
- **Patch** (0.1.x): Bug fixes
- **Minor** (0.x.0): New features
- **Major** (x.0.0): Breaking changes

### Publishing
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Publish to VS Code Marketplace

## 📞 Getting Help

### Communication Channels
- **Issues:** [GitHub Issues](https://github.com/ZainulabdeenOfficial/Live_Database_VSCode_Extention/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ZainulabdeenOfficial/Live_Database_VSCode_Extention/discussions)

### Code of Conduct
- Be respectful and inclusive
- Help others learn
- Give constructive feedback
- Follow project guidelines

## 🙏 Acknowledgments

Thank you to all contributors who help make this extension better!

---

**Happy Contributing! 🚀**
