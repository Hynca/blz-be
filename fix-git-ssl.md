# Fixing Git SSL Certificate Problems

When encountering the error:

```
fatal: unable to access 'https://github.com/Hynca/blz-be.git/': SSL certificate problem: unable to get local issuer certificate
```

Try one of these solutions:

## Solution 1: Disable SSL Verification (less secure)

You can temporarily disable SSL verification with the command:

```bash
git config --global http.sslVerify false
```

**Warning**: This disables SSL verification globally, which is less secure. Only use this in trusted environments.

## Solution 2: Update Git's CA Bundle (recommended)

1. Download a certificate bundle:

   - For Windows: Download from https://curl.se/ca/cacert.pem
   - Save it somewhere permanent, e.g., `C:\Users\YourUsername\cacert.pem`

2. Configure Git to use this certificate bundle:

   ```bash
   git config --global http.sslCAInfo "C:\Users\YourUsername\cacert.pem"
   ```

3. Or set the environment variable in PowerShell:
   ```powershell
   $env:GIT_SSL_CAINFO="C:\Users\YourUsername\cacert.pem"
   ```

## Solution 3: Update Corporate Proxy Settings

If you're behind a corporate proxy:

```bash
git config --global http.proxy http://your-proxy:port
```

## Solution 4: Update Git

Outdated Git versions may have certificate issues. Update to the latest version:

- Windows: Download from https://git-scm.com/download/win

After implementing any solution, try your git command again.
