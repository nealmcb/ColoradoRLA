# Colorado Risk-Limiting Audit (RLA) Software

[![Build Status](https://travis-ci.org/democracyworks/ColoradoRLA.svg?branch=master)](https://travis-ci.org/democracyworks/ColoradoRLA)

The Colorado RLA Software is designed to help local and state election officials
conduct efficient and effective risk-limiting audits of their elections. The
initial code was developed by the Colorado Department of State through a
contract with Free & Fair in 2017, and is now being developed and maintained by
[Democracy Works](https://democracy.works), a 501(c)3 nonpartisan, nonprofit
organization.

## What is a risk-limiting audit?

A [risk-limiting audit](https://en.wikipedia.org/wiki/Risk-limiting_audit) is an
audit of the results of an election which uses statistical methods to give high
confidence that the winner(s) of the election were reported correctly.

In Colorado, citizen audit boards examine a random sample of original paper
ballots from an election, comparing the votes marked on each original paper
ballot with the electronic representation of votes recorded by the vote
tabulation system. Under most circumstances, this method requires auditing far
fewer ballots than a full hand recount or fixed-percentage audit, while also
providing strong statistical evidence that the outcome of the election was
correct.

## Description

The RLA Software is designed to facilitate a statistically valid audit of vote
tabulation processes by comparing the votes marked on a random sample of
original paper ballots with the electronically recorded votes for those same
ballots.

The RLA Software:

1. Calculates how many original paper ballots need to be audited for the
   targeted contest(s).
2. Randomly selects which original paper ballots will be audited and creates
   lists to help local election officials find the necessary ballots in storage.
3. Provides an interface for audit board teams to record the votes they see
   marked on the original paper ballot(s).
4. Checks whether the audited votes and recorded votes for each ballot match,
   and determines at the end of the audit round whether the desired confidence
   interval has been achieved based on these results (if not, additional ballots
   are randomly selected and audited).
5. Provides metrics and monitoring capabilities for election officials and
   public observers that indicate the progress and outcome of the audit.

## Development (Docker)

We publish Docker containers for the three major components of the system, built
automatically from the `master` branch.

You can use these containers to get started working on a single piece of the
system.

### Requirements

- [`docker`](https://docs.docker.com/install/)
- [`docker-compose`](https://docs.docker.com/compose/)

### Setup

Build the latest development images:

```sh
docker-compose build
```

You do not need to do this every time, just when you need to update a component.
Otherwise, `docker-compose up` will use the existing Docker images that are on
your system, which may not be what you want (e.g. if you want to test some
changes you made, you need to rebuild the dependent image).

### Running

Assuming you now have up-to-date images, you can bring up the system with those
images:

```sh
docker-compose up
```

The application frontend will then be accessible at **`localhost:8080`**.

Once the system is running, the server will create the PostgreSQL schema. After
this, test credentials will be installed by the `test-credentials` service.

With the test credentials loaded, you should be able to log in as a state
administrator using `stateadmin1` as the username with any password, and as a
county administrator with `countyadmin1` as the username along with any
password. There are other usernames, especially for the counties (`countyadmin1`
maps to a specific county). You may be able to use this file as a hint for the
others:
`server/eclipse-project/src/main/resources/us/freeandfair/corla/county_ids.properties`

#### Modifying the workflow

As an example, an easy way to get started if you **just want to work on the
client** would be to run the following:

```sh
## OPTIONAL: Build updated images first
# docker-compose build postgresql server
docker-compose up postgresql server test-credentials
```

This will start the database, the API server, and automatically seed test
credentials when the server comes up. Then, all you need to do is enter
`client/` and follow the usual `npm install; npm start` workflow to fire up a
development server, and you're off!

## Development (non-Docker)

There are three main components of the system that are required for development:

1. [TypeScript web client](client/README.md)
2. [Java API server](server/eclipse-project/README.md)
3. PostgreSQL database

Once you have read through the overviews of each, you will want to do the
following:

1. Start a PostgreSQL database. You can start one from a Docker image, or you
   can use a database on your machine or a development server. If the database
   is not available at `localhost:5432`, you may need to adjust the server
   configuration later.
2. Start the API server. The server will connect to the PostgreSQL database and
   automatically create the schema for you. If your API server is not available
   at `localhost:8888`, you may need to adjust the client configuration later.
3. Seed the database with test credentials. These are available in
   `test/sql/corla-test-credentials.psql`. It is required that the server starts and
   populates the schema first.
4. Start the client.

## Releases

`script/build-release` is a script that can be run unattended and will build a
release ZIP file in
`server/eclipse-project/target/colorado-rla-release-VERSION.zip` containing
production-ready builds of the code in this repository.

## Documentation

More documentation can be found under [`docs`](docs/README.md).

## Contributors

- [Democracy Works](https://democracy.works)
- [Free & Fair](https://http://freeandfair.us)
- [Colorado Department of State](https://www.sos.state.co.us/pubs/elections/auditCenter.html)
- [Colorado County Clerks Association](www.clerkandrecorder.org/)
- Special thanks also to Philip Stark, Ron Rivest, Mark Lindeman, and others in
  the State Audit Working Group and RLA Representative Group for their work to
  develop and refine risk-limiting audits
