# Colorado RLA Software Development - API Server

## Overview

The Colorado RLA API server uses the following technologies, appearing in order
of importance to the software:

- Java
- [Spark][spark] as the HTTP request and response framework
- [Hibernate][hibernate] as an ORM

## Quick start

Check the [README.md](../../server/eclipse-project/README.md) to get up and
running quickly.

## Eclipse

One of the first things you will notice is `eclipse-project/` directly beneath
`server/`. Free and Fair used Eclipse extensively in their development process.
None of the developers from Democracy Works opted to use Eclipse, so development
is possible with Eclipse but also with another editor or IDE. Check
[README-ECLIPSE.md](../../server/README-ECLIPSE.md) for setup instructions if
you want to use Eclipse.

## Terms

- **Package**: When talking about the API server code, **package** will be used
  to denote a Java package. All of these packages can be found listed as the
  top-level directories under
  `server/eclipse-project/src/main/java/us/freeandfair/corla`.

## Files and directories

- `server/`
  - `deploy/`: Deployment configuration for the Apache server used in
    production.
  - `eclipse-project/`
    - `findbugs-exclude.xml`: [FindBugs][findbugs] rules to exclude.
    - `pom.xml`: The Maven "Project Object Model", which is the fundamental
      configuration file for Maven. You can update dependency versions as well
      as the project version by changing this file.
    - `project_configuration/`: These are configuration files **for the project
      linters**. You can get a sense of which linters are used and how by
      looking in this directory.
    - `script/`: Some of these scripts may be useful as they give hints for
      interacting with the RLA server and PostgreSQL database. Additionally,
      `rla_export/` is housed here.
    - [`src/`][source-guide]
      - `main/resources/`: Here you can configure logging with
        `log4j.properties`, or the Java system properties for the application
      under `us/freeandfair/corla/default.properties`.
      - [`main/java/`][source-guide]: All of the source code lives here. TODO: Link to source
        docs

## Configuration

Configuration for the API server is primarily done via Java system properties,
located in
`server/eclipse-project/src/main/resources/us/freeandfair/corla/default.properties`.
You may see references to the Java system properties file throughout the
documentation - this is what is referred to.

## Development

### Common tasks

#### Adding an API endpoint

1. Write the API endpoint class under the `endpoint` package. TODO: Link to
   package-level docs.
2. Add an entry to
   `server/eclipse-project/src/main/resources/us/freeandfair/corla/endpoint/endpoint_classes`
   containing the name of the class you just wrote. This allows the system to
   discover the class at runtime.

## Using the application

There are two main sections of the application, corresponding to county users
and Department of State users, located under the URLs `/county`
and `/sos` respectively.

Unauthenticated users will always be redirected to `/login`. If a logged-in
Department of State or a county user navigates to `/`, they will be redirected
to `/sos` or `/county`, as appropriate.

[findbugs]: http://findbugs.sourceforge.net/
[hibernate]: http://hibernate.org/
[source-guide]: source-guide.md
[spark]: http://sparkjava.com/
