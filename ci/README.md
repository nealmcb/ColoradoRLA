# Colorado RLA Software - Continuous Integration

[Continuous integration][continuous-integration] is a software development
practice in which automated test suites, linters, etc. are run against the
codebase automatically.

## Overview

Continuous integration for the Colorado RLA project is set up using Travis CI.
Check `.travis.yml` in the root of the repository for the Travis CI definition.

## Setup

### Travis CI

If you fork this repository, you will almost certainly need to make a few
changes to the `.travis.yml` to ensure notifications are set up the way you want
them to work on your own.

Additionally, you will have to set up some integration between your fork of the
repository and the Travis CI system. See the [Travis CI docs][travis-ci-docs]
for details.

### Alternative CI system

You can optionally run your own continuous integration system instead of Travis
CI, in which case you will want to make use of the CI test scripts in this
directory:

* `ci/check-client`: This script runs CI-based tests against the TypeScript
  frontend (client).
* `ci/check-server`: This script runs tests designed for a continuous
  integration environment against the API server

[continuous-integration]: https://en.wikipedia.org/wiki/Continuous_integration
[travis-ci-docs]: https://docs.travis-ci.com/
