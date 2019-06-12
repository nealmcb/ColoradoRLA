# Colorado RLA Software - Quirks

- On the frontend, the [React hot-loader][react-hot-loader] that is used in
  development will cause backend polling requests to be duplicated, and "stack"
  over time, resulting in multiple redundant requests to the backend every
  polling period. This will tie up system resources, and you may need to
  manually refresh during development to clear it. However, **it is only an
  issue in development** since the hot loader, maybe obviously, is not used in
  production.
  - The issue can probably be fixed by hooking into the hot-loader or by
    adjusting the polling higher-order-component in some way.

- Tied contests are not supported.

- County IDs are hard-coded into both the frontend and the API server.

- You cannot upload a ballot manifest while a CVR export is in progress - it
  will always fail.
  - This is because the [ASM][asm] cannot represent the state where both files
    are uploading at the same time. Making changes to the [ASM][asm] is risky,
    because missing a transition can cause the application to halt unexpectedly
    in certain circumstances.

- The dismissable notices and error messages (called [toasts][blueprint-toasts])
  will sometimes not appear immediately after an error occurs, but come up some
  time later.

- Many pages on the frontend do not wait for API calls to complete before
  proceeding to the logical "next page". This is evident at the end of the
  contest and choice standardization process, when contests are targeted for
  selection. Sometimes you will see the contest names change after arriving at
  the targeted contest screen. This falls out of the original code's
  architectural decision to rely heavily on periodic polling to refresh
  application state.

- `redux-saga` is a clean way to express side-effects in the code, but it is not
  used everywhere it should be, resulting in overly complicated code in places.

- On the frontend, `src/component/withSync.tsx`, `src/component/withPoll.tsx`,
  and `types/index.d.ts` contain complex types, often with names such as `bind`
  that have meaning in languages like Haskell but are out of place in
  TypeScript, not mapping to React or redux concepts. This is likely a result of
  the authors' backgrounds.

- The system cannot take partial configuration - you need to supply an entirely
  different Java properties file if you want to override even a single line in
  the default configuration file.

[asm]: asm.md
[blueprint-toasts]: https://blueprintjs.com/docs/versions/2/#core/components/toast
[react-hot-loader]: https://gaearon.github.io/react-hot-loader/
