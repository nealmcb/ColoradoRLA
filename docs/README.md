# Colorado RLA Software Documentation

## Concepts

Themes of the software which you will encounter, and may have questions about.

- [`asm`][asm]: The Abstract State Machine, introduced by Free and Fair as a
  tool to aid in formal reasoning about the system, but has development-time
  tradeoffs.
- [`dashboard`][dashboards]: In the RLA Software, the term "Dashboard" is
  overloaded, and both refers to a UI component (the more traditional usage),
  but also is a reified data structure that contains summary data used
  throughout the application, loosely associated with the three main UI
  dashboards in the system.

## Source guides

Guides to the source code can be found below:

- [API server source guide][server-source-guide]
- [Web client source guide][client-source-guide]

## Directory structure

- [`ci`][ci]: Continuous integration support.
- [`client`][client-readme]: The front-end of the tool, written in TypeScript
  and making use of React and redux.
- [`docker`][docker]: Dockerfiles for building project components,
  used heavily by Democracy Works for creating staging and testing environments.
- `script`: Scripts that are generally useful for the project. Currently
  includes a script used to build project releases. The release-building script
  might be useful to read to understand how the project fits together.
- [`server`][server-readme]: The back-end of the tool including the API
  server. This is where the bulk of the code is located.
- [`test`][test]: End-to-end test scripts, test credentials, and test data.
- `tools`: Used by Free and Fair to build documentation, not currently used.

## Improvements

There is still a lot of work to do! If you would like to start improving the
software, the [next steps][next] document can get you started.

## Known Quirks

Read over the [list of inherited quirks][quirks] with the way the software and
development environment work.

## Free and Fair documentation

The original documentation for this software is available under the `freeandfair` directory.

[asm]: asm.md
[ci]: ../ci/README.md
[docker]: ../docker/README.markdown
[client-readme]: client/README.md
[client-source-guide]: client/source-guide.md
[dashboards]: dashboards.md
[next]: next.md
[quirks]: quirks.md
[server-readme]: server/README.md
[server-source-guide]: server/source-guide.md
[test]: ../test/README.md
