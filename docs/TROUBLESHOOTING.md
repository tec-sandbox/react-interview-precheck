# Troubleshooting

## Incorrect Node.js version

Run `node --version`. The check requires Node.js **26.x**. Install the correct release from https://nodejs.org/ and reopen your terminal. A version manager may be useful if multiple versions are installed.

## `npm` or `git` not found

Install Node.js (which includes npm) or Git, then reopen your terminal. Run `npm --version` and `git --version` to confirm.

## npm installation fails

Check your internet connection, proxy settings and any corporate npm registry. Retry `npm run check`. If you see permissions errors, use a Node version manager rather than running npm as administrator.

## `code` is not found

VS Code may still be installed. Open the project manually. On macOS, VS Code can add the `code` shell command through its command palette. This warning does not fail the precheck.

## TypeScript or Vite build fails

Check the first build error in the terminal. From a clean checkout, run `npm ci` and repeat `npm run check`. Do not modify the exercise or install React packages globally.

## Preview server does not start

Local security software may prevent a loopback server from listening. Ensure `127.0.0.1` is accessible and repeat the check. The script requests an operating-system-assigned free port, so an occupied fixed port should not be an issue.

## Does this require Docker?

No. Docker is not part of this React frontend precheck. Any separate backend interview requirements should be communicated independently.
