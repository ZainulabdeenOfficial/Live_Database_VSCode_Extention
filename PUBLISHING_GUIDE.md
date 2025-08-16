# 🚀 Publishing Guide - Live Database Playground to VS Code Marketplace

## 📋 Prerequisites

Before publishing, ensure you have:
- ✅ **Microsoft Account** or **GitHub Account**
- ✅ **Publisher Account** on VS Code marketplace
- ✅ **Personal Access Token** (PAT) with publish permissions
- ✅ **Extension package** ready (VSIX file)

## 🎯 Step-by-Step Publishing Process

### Step 1: Create Publisher Account

1. **Visit**: https://marketplace.visualstudio.com/
2. **Sign in** with your Microsoft or GitHub account
3. **Click**: "Publish extensions"
4. **Create**: A new publisher account
5. **Note**: Your publisher name (e.g., "john-doe", "mycompany")

### Step 2: Update Package.json

Replace the placeholder values in `package.json`:

```json
{
  "name": "live-database-playground",
  "displayName": "Live Database Playground",
  "publisher": "YOUR-REAL-PUBLISHER-NAME",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/live-database-playground.git"
  }
}
```

### Step 3: Create Personal Access Token

1. **Go to**: https://dev.azure.com/
2. **Sign in** with your Microsoft account
3. **Click**: "Personal access tokens"
4. **Create**: New token with these settings:
   - **Name**: VS Code Extension Publishing
   - **Organization**: All accessible organizations
   - **Expiration**: 1 year (recommended)
   - **Scopes**: Marketplace (Publish)
5. **Copy**: The generated token (keep it secure!)

### Step 4: Login to VSCE

```bash
# Replace YOUR-PUBLISHER-NAME with your actual publisher name
vsce login YOUR-PUBLISHER-NAME
```

When prompted, paste your Personal Access Token.

### Step 5: Package Your Extension

```bash
npm run package
```

This creates: `live-database-playground-0.1.0.vsix`

### Step 6: Publish to Marketplace

```bash
vsce publish
```

Or publish a specific version:

```bash
vsce publish patch  # 0.1.0 → 0.1.1
vsce publish minor  # 0.1.0 → 0.2.0
vsce publish major  # 0.1.0 → 1.0.0
```

## 🎨 Logo Requirements

Before publishing, ensure you have proper PNG logos:

### Required Logo Files
- `resources/logo.png` (128x128) - Extension icon
- `resources/icon.png` (128x128) - Activity bar icon  
- `resources/banner.png` (1280x320) - Marketplace banner

### Generate PNG Logos
Follow `LOGO_GUIDE.md` to convert the SVG to PNG:
1. Use online converters (Convertio, CloudConvert)
2. Or use command line tools (ImageMagick, Sharp)
3. Or use design software (Illustrator, Inkscape, Figma)

## 📋 Publishing Checklist

Before publishing, verify:

- [ ] **Publisher name** is correct in package.json
- [ ] **Repository URL** is correct in package.json
- [ ] **PNG logos** are generated and included
- [ ] **Extension compiles** without errors
- [ ] **VSIX package** is created successfully
- [ ] **Personal Access Token** is valid
- [ ] **VSCE login** is successful

## 🚀 Publishing Commands

```bash
# 1. Compile the extension
npm run compile

# 2. Package the extension
npm run package

# 3. Login to VSCE (first time only)
vsce login YOUR-PUBLISHER-NAME

# 4. Publish the extension
vsce publish

# 5. Publish with version bump
vsce publish patch  # Bug fixes
vsce publish minor  # New features
vsce publish major  # Breaking changes
```

## 🎯 After Publishing

### Extension Page
Your extension will be available at:
```
https://marketplace.visualstudio.com/items?itemName=YOUR-PUBLISHER-NAME.live-database-playground
```

### Installation Command
Users can install with:
```bash
code --install-extension YOUR-PUBLISHER-NAME.live-database-playground
```

### Marketplace Features
- ✅ **Extension page** with description and screenshots
- ✅ **Download statistics** and ratings
- ✅ **Version history** and release notes
- ✅ **User reviews** and feedback
- ✅ **Search and discovery** in VS Code

## 🔄 Updating Your Extension

### For Bug Fixes
```bash
vsce publish patch
```

### For New Features
```bash
vsce publish minor
```

### For Major Changes
```bash
vsce publish major
```

## 🐛 Troubleshooting

### Common Issues

**"Access Denied" Error**
- Verify your Personal Access Token has "Marketplace (Publish)" scope
- Ensure you're using the correct publisher name
- Check if your token hasn't expired

**"Publisher Not Found" Error**
- Verify your publisher account exists
- Check the publisher name spelling in package.json
- Ensure you're logged in with the correct account

**"Extension Already Exists" Error**
- Use `vsce publish patch` to update existing version
- Or change the extension name in package.json

### Getting Help

- **VS Code Marketplace**: https://marketplace.visualstudio.com/
- **VSCE Documentation**: https://github.com/microsoft/vscode-vsce
- **Publisher Management**: https://marketplace.visualstudio.com/manage/publishers/

## 🎉 Success!

Once published, your extension will be:
- ✅ **Available** on VS Code marketplace
- ✅ **Searchable** by users
- ✅ **Installable** directly from VS Code
- ✅ **Updatable** through the marketplace
- ✅ **Trackable** with download statistics

---

**🚀 Your Live Database Playground extension will be live on the VS Code marketplace!**
