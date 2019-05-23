# Colorado RLA Software Development - Client (frontend)

## Overview

The Colorado RLA frontend uses the following technologies, appearing in order of
importance to the software:

- [TypeScript][typescript] as the language
- [React 16][react-16] as the underlying frontend technology
- [Blueprint v2][blueprint-v2] for the UI component framework
- [redux][redux] (via the [`react-redux`][react-redux] React bindings)

## Quick start

Check the [README.md](../../client/README.md) to get up and running quickly.

## Files and directories

The basics of JavaScript tooling is out of scope for this document, but
documentation for nearly all of the technology used by the client is easy to
find online. The goal of this documentation is to help you navigate the source
code, but the concepts themselves are better explained by the tool authors!

- `babel.config.js`: [Babel][babel] presets and configuration. Rarely needs
  modification.
- `dist`: The target directory for production build artifacts.
- `index.html`, `index.prod.html`: Entrypoints for the application, served as a
  static page. Must require the appropriate CSS from Blueprint as well as the
  compiled JS bundle representing the application.
- `karma.config.js`: Karma (test runner) configuration.
- `npm-shrinkwrap.json`: An [alternative][npm-shrinkwrap] to
  `package-lock.json`.
- `package.json`: Package version ranges used by the application.
- `README.md`: Quick start for getting up and running with the client.
- `screen.css`: The CSS for the application. This is the only file - there is
  no preprocessor.
- `script/`: Development helper scripts such as bundling releases and running
  tests.
- [`src/`][source-guide]: Source code for the application.
- `test/`: Tests for the application.
- `test.index.js`: Test selector and runner - pulls in the right files
  containing tests for the application.
- `tsconfig.json`: TypeScript configuration file.
- `tslint.json`: TypeScript linter configuration.
- `webpack.config.js`, `webpack.config.prod.js`: Webpack build tool
  configuration for development and production, respectively.

## Using the application

There are two main sections of the application, corresponding to county users
and Department of State users, located under the URLs `/county`
and `/sos` respectively.

Unauthenticated users will always be redirected to `/login`. If a logged-in
Department of State or a county user navigates to `/`, they will be redirected
to `/sos` or `/county`, as appropriate.

[babel]: https://babeljs.io/
[blueprint-v2]: https://blueprintjs.com/docs/versions/2/
[react-16]: https://reactjs.org/
[redux]: https://redux.js.org/
[react-redux]: https://redux.js.org/basics/usage-with-react
[npm-shrinkwrap]: https://docs.npmjs.com/cli/shrinkwrap.html
[source-guide]: source-guide.md
[typescript]: https://www.typescriptlang.org/docs/home.html
