# React Frontend — Environment Precheck

This repository checks your local development environment before a frontend technical interview. **It does not contain the interview exercise.**

## Requirements

- **Node.js 26.x** and npm: https://nodejs.org/
- **Git**: https://git-scm.com/downloads
- **Visual Studio Code**: https://code.visualstudio.com/ (open it manually; command-line detection is advisory)
- Internet access for the initial download of npm packages

React, React DOM, TypeScript and Vite are installed as project dependencies. **You do not need to install them globally.** Docker is **not** required for this frontend check.

## Instructions for candidates

1. Install the requirements above.
2. Clone this repository (or download it as a ZIP) and open its folder in VS Code.
3. In the project folder, run:

   ```bash
   npm run check
   ```

4. If the final line is **`✓ READY FOR INTERVIEW`**, your local environment passed the check. Otherwise, follow the indicated error and retry.
5. Share a screenshot of the final summary with the recruiter. Please avoid including personal information.

The command installs missing npm dependencies, verifies the React and tooling packages, type-checks and builds the application, renders a React component with React DOM, serves the built application locally, checks the HTTP response, and shuts down the temporary server.

### Expected output (example)

```text
✓ Node.js 26.x
✓ npm available
✓ Git available
✓ npm dependencies installed
✓ React / React DOM / TypeScript / Vite available
✓ TypeScript compilation and Vite production build
✓ React component renders successfully
✓ Local HTTP preview responds
✓ READY FOR INTERVIEW
```

VS Code command-line detection is advisory: the check can succeed even if the `code` command is not on your PATH.

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).
