# Testing scripts
This test are designed as an end-to-end test. They use the api to emulate the
behavior of real clients. These tests do not test the client however; there is
no browser automation, just an api client. 

There are two purposes for these tests, one is to load up a lot of test data, for
which you can see `load/README.md`. The other is to see if changes to the code
may have broken anything. This is a high level, happy path smoke test.

## Smoke test

To start the server with a clean slate(recreated database) run:

`./setgo.sh`

In another terminal run the api client. This are the commands to execute a
simple successful audit.

`./genrun import -c 1`
`./genrun init`
`./genrun startRound`
`./genrun performRound`
