# Colorado RLA Software Source Guide: Web Client

## Directory contents

There is definitely a learning curve for many of these concepts. For the
following directories in which a link appears, it is highly recommended that you
understand the basics of the linked topic first, as that information is not
reproduced in this document.

- `action/`: [Redux actions][redux-actions] and functions which create actions.
  Things which perform side-effects should go here.
- `adapter/`: Contains modules which transform JSON into an internal data
  structure format used by the application, as well as transforming the internal
  data structure format back into JSON. In short, you might put code which
  translates to and from the format used by the API in here.
- `component/`: Contains React component definitions. The React components use
  Redux in order to [`connect`][react-redux-connect] components to the internal
  application data store. Make sure you understand the `react-redux` model
  before making extensive changes to these components.
- `config.ts`: Application configuration, such as CDOS contacts, API polling
  delays, and timeouts for notification popups.
- `data/`: Hardcoded data. Currently, just the Colorado counties and their
  database IDs.
- `date.ts`: Common date/time functionality.
- `format.ts`: Common data formatting functions primarily aimed at display use
  (e.g. for use in React components).
- `notice.ts`: Common functions for showing notices (Blueprint calls these
  widgets `Toast`s).
- `reducer/`: [Redux reducers][redux-reducers]. Check out `root.ts` in this
  directory for the connection between the reducer logic contained in module in
  this library and the application core.
- `saga/`: [Redux sagas][redux-saga]. At its core, sagas are about managing
  complicated chains of effects in the system, e.g. calling an HTTP API and then
  doing something with its result, but handling possible failures throughout. By
  isolating that logic to a saga, it becomes easier to reason about in the
  application. As with reducers, check out `root.ts` for the connection between
  the saga logic and the core of the application.
- `selector/`: Abstractions for getting data out of complex data structures such
  as the application state. Predicates, or questions you can ask about the
  application state, would live here too. An example predicate might be "is the
  audit board done with its sequence of ballots?" This implementation lives in
  `selector/county/isAuditBoardDone.ts`.
- `session.ts`: Client-side session management.
- `store.ts`: Defaults for the application state are read in here, and applied
  to the [Redux store][redux-store]. This is basically the initializer for the
  application state.
- `types/`: All of the shared TypeScript types belonging to the system. These
  are declared as [ambient modules (look for "Ambient modules")][ts-modules].
  This has the drawback of introducing global type names implicitly into your
  modules, but requires fewer imports. In the future, it would be desirable to
  refactor these ambient modules into first-class modules that are imported by
  the code that uses them.
- `type.ts`: Top-level code that makes type-level decisions about a given piece
  of state based on its `type` property, so that the state can be type-checked
  throughout the application.
- `util.ts`: Utility module containing generally useful functions that can be
  used throughout the application.

[redux-actions]: https://redux.js.org/basics/actions
[redux-reducers]: https://redux.js.org/basics/reducers
[redux-saga]: https://redux-saga.js.org/
[redux-store]: https://redux.js.org/api/store
[react-redux-connect]: https://react-redux.js.org/api/connect#connect
[ts-modules]: https://www.typescriptlang.org/docs/handbook/modules.html
