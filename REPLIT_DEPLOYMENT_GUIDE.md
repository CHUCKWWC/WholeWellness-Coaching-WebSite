# REPLIT DEPLOYMENT CONFIGURATION

## Required Manual Edit

You must manually add this to your `.replit` file. Open the `.replit` file in your Replit editor and replace the entire content with:

```toml
modules = ["nodejs-20"]

[nix]
channel = "stable-25_05"

[deployment]
run = ["node", "start.js"]
build = ["node", "build.js"]

[[ports]]
localPort = 5000
externalPort = 80
```

## Alternative Deployment Method

If the above doesn't work, try this configuration:

```toml
modules = ["nodejs-20"]

[nix]
channel = "stable-25_05"

[deployment]
run = ["sh", "deploy.sh"]

[[ports]]
localPort = 5000
externalPort = 80
```

## Verification Steps

After editing `.replit`:

1. **Test Build**: Run `node build.js` in terminal
2. **Test Start**: Run `node start.js` in terminal  
3. **Deploy**: Click the Deploy button in Replit

## Why This Fix Works

- **Build Command**: `node build.js` compiles frontend assets
- **Run Command**: `node start.js` starts the Express server
- **Port Configuration**: Maps internal port 5000 to external port 80
- **Module**: Uses Node.js 20 runtime environment

## Expected Deploy Process

1. Replit runs `node build.js` (builds frontend)
2. Replit runs `node start.js` (starts server)
3. Application serves on external port 80
4. Internal Express server runs on port 5000

Your application is code-ready. The only missing piece is the deployment configuration in `.replit`.