# Colorado RLA Software Source Guide: API Server

This guide corresponds to the source code located (relative to the project root)
at `server/eclipse-project/src/main/java/us/freeandfair/corla/`.

## Packages

Each of the top-level directories is a Java package. An overview of each is
included along with links to interesting code snippets.

### `asm`

This is where code related to the [abstract state machine][asm] lives. Please
read the linked guide on what an abstract state machine is and why it was
included in the codebase.

### `auth`

The `auth` package primarily contains the interface to authentication backends.
The backend used by the Colorado Department of State is `EntrustAuthentication`,
which implements the `AuthenticationInterface` from this package. That Entrust
authentication backend is plugged in by naming the class in the Java system
properties for the application.

#### Important files

In addition to the interesting files below, there are a number of supporting
classes. However, these are key to understanding the system:

- [`AbstractAuthentication.java`][auth-abstractauthentication]: This contains
  authentication code common to all authentication methods. If you only need to
  make a change to the way authentication occurs with Entrust, you should modify
  that proprietary Java class. Otherwise, if it is common to all authentication
  methods, it should probably be added here.
- [`AuthenticationInterface.java`][auth-authenticationinterface]: The interface
  that must be satisfied for all authentication methods.

### `controller`

Coordination and orchestration of the application. `endpoint`s will often invoke
a method in here, which may in turn make requests to the data model. Many times,
execution paths through the code will take a route like this, where each of the
names below corresponds to a package described in this document:

```
endpoint ->(calls)   controller ->(calls)   model/query
endpoint <-(returns) controller <-(returns) model/query
```

so if you are looking to get started with a given action, it is recommended that
you take a look at classes in `controller` or `endpoint`.

#### Important files

Nearly all of the classes in this package are crucial to the operation of the
application.

- [`AuditReport.java`][controller-auditreport]: See Javadoc.
- [`BallotSelection.java`][controller-ballotselection]: Coordination for ballot
  selection queries
- [**`ComparisonAuditController.java`**][controller-comparisonauditcontroller]:
  This is one of the most important classes in the system. This orchestrates
  nearly all of the important behavior of the application.
- [`ContestCounter.java`][controller-contestcounter]: Orchestrates calculations for vote tallies across contests (contrasted with
  the original code which only calculated votes within counties).
- [`DeleteFileController.java`][controller-deletefilecontroller]: Orchestrator
  for requests which delete files. "Files" is a generic term including, and
  currently limited to, ballot manifests and CVR exports.
- [`ImportFileController.java`][controller-importfilecontroller]: Orchestrator
  for requests which read and import files that have previously been uploaded.
  So, this controller is not responsible for the uploading of the file into the
  system, but is responsible for the process of extracting useful information
  out of that file and into the database.

### `crypto`

Core cryptographic functionality for the application is located here. There is
not a lot of code, but it deals with the SHA-256 hash implementation for
checking uploaded files as well as the pseudorandom number generator which
drives ballot selection.

For more about the method of pseudorandom number generation, consult [Ron
Rivest's reference implementation][rivest-sampler]. The two implementations
should generate the same numbers (outputs) given the same inputs.

### `csv`

This package is responsible for the actual parsing of the ballot manifest and
CVR export files, both in CSV format. The package name may be a bit misleading
and overly specific, as uploaded files could, in the future, be in one of
several formats, but currently only CSV is handled.

The parsers currently implement interfaces for future extensibility which are
located in this package, but there is only one real implementation for each of
the ballot manifest and CVR export parser interfaces.

#### Important files

- [`ColoradoBallotManifestParser.java`][csv-coloradoballotmanifestparser]: The
  ballot manifest parser implementation.
- [`DominionCVRExportParser.java`][csv-dominioncvrexportparser]: The CVR export
  parser implementation.

### `endpoint`

All of the HTTP endpoints are handled by classes in this package. Typically,
code in this package will invoke a controller to orchestrate a particular set of
actions.

The reason [Spark][sparkjava] was chosen by Free and Fair over something more
traditional such as Spring is unknown, but the author's assumption is that Spark
provided a minimal framework from which to start the project, without
constraining the architecture. At this point in time, it would be worth
evaluating whether that tradeoff still holds.

#### Important files

- [`Endpoint.java`][endpoint-endpoint]: The Java interface that all of the
  endpoints must implement.
- [`AbstractEndpoint.java`][endpoint-abstractendpoint]: Code common to all
  endpoint classes. It is recommended that you read this first, because
  subclassing code will often refer to methods in this class.
- [`AbstractAuditBoardDashboardEndpoint.java`][endpoint-abstractauditboarddashboardendpoint]:
  Imposes some authorization restrictions so that audit boards are allowed to
  access endpoints subclassing this class.
- [`AbstractCountyDashboardEndpoint.java`][endpoint-abstractcountydashboardendpoint]:
  Imposes some authorization restrictions so that county-level users are allowed
  to access endpoints subclassing this class.
- [`AbstractDoSDashboardEndpoint.java`][endpoint-abstractdosdashboardendpoint]:
  Imposes some authorization restrictions so that state-level users are allowed
  to access endpoints subclassing this class.

### `json`

These classes are used with Google's [GSON][gson] library. Their main purpose is
to describe common structures so that you can easily transform data between JSON
and Java classes.

Commonly, the classes will be used in the following way:

```java
MyStructure structure = Main.GSON.fromJson(someJsonString, MyStructure.class);
```

If you commonly parse JSON into a Java data structure or marshal the same Java
data structure into JSON, consider putting that code into a class in this
package.

#### Important files

- [`FreeAndFairNamingStrategy.java`][json-freeandfairnamingstrategy]: Free and
  Fair uses a specific naming convention in their Java classes. Class members
  are prefixed with `my_` in the Free and Fair naming strategy. [GSON][gson]
  supports automatic translation of Java class members into JSON field names,
  and this class implements this strategy by stripping out the `my_` prefix,
  since it does not have meaning outside of the Java class names.

### `math`

Implements the core risk-limiting audit calculations used by the system. The
class [`Audit.java`][math-audit] contains detailed comments describing where the
calculations come from, since they are mostly derived directly from the
literature.

### `model`

The `model` classes mostly implement [Hibernate ORM][hibernate] persistent
entities, and so directly correspond to the PostgreSQL database tables and
columns. Placing business logic in these classes is discouraged, and if you find
it, should be factored out into a `controller` or elsewhere.

It is important to understand how the [Hibernate ORM][hibernate] works before
adding new classes to the system, so if you are not familiar with Hibernate,
check out a guide on the Hibernate site.

### `persistence`

Much like the `json` package, `persistence` is all about common transformations
to and from Java code, but instead of strictly dealing with JSON (frequently
used to communicate with the outside world), these classes are more about
transforming data so that it can be persisted to the PostgreSQL database. In
some cases, complex structures are serialized as JSON and stored as strings in
database tables. When these columns are read back, they are deserialized and
stored as `Map`s or custom objects.

#### Important files

- [`Persistence.java`][persistence-persistence]: This is another very important
  class in the system, and you will see references to it throughout the
  software. This class wraps the Hibernate API with useful methods specific to
  the Colorado RLA application and the methods of database access that Free and
  Fair preferred. You will want to read through it to understand how method
  calls in the software translate to the Hibernate API.

### `query`

Classes wrapping complex database queries. While quite a bit of database work
can be done through the simple CRUD functionality provided by Hibernate,
reporting (for example) requires more complex queries, and those live in the
`query` package.

### `report`

Classes generating common reports in the system, and supporting functionality.
If you are looking to modify any aspect of a report generated by the system,
start looking in here.

### `util`

No project would be complete without some kind of `util` package, now would it?
The classes in `util` do not easily fit into any of the other packages, and may
represent very common functionality used across the system, such as custom
comparators for sorting strings with numbers in them.

## Naming Conventions

Some of the naming conventions used in the code and established by Free and Fair
may be unfamiliar to Java developers. Namely:

- the `my_` prefix, which is a convention used to denote **object members**, and
- the `the_` prefix, which is a convention used to denote **method arguments**.

One reason these conventions were established was to avoid bugs that could arise
out of ambiguity allowed by Java. For instance, Java allows something like the
following class:

```java
class Foo {
  private String name;

  public Foo(String name) {
    name = name;
  }
}
```

The ambiguity of the identifier `name` could be a potential source of bugs: in a
longer method, `name` could refer to a local variable and get overwritten when
you may have intended to set the object member identified by `name`, as an
example. By using `the_name` and `my_name` to refer to the method argument and
object member, respectively, the ambiguity disappears, and the use of those
prefixes can be enforced by a style checker.

The constraints on naming has since been relaxed to be more comfortable to more
traditional Java developers, and there are other methods, enforceable by
tooling, of automatically detecting and preventing the sorts of bugs described
above that do not add `my_` and `the_` prefixes to identifiers in the code.

Which one you choose is a matter of taste, and you should pick the style that
makes sense for your team.

[asm]: ../asm.md
[gson]: https://github.com/google/gson
[hibernate]: https://hibernate.org/
[rivest-sampler]: https://people.csail.mit.edu/rivest/sampler.py
[sparkjava]: http://sparkjava.com/

[auth-abstractauthentication]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/auth/AbstractAuthentication.java
[auth-authenticationinterface]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/auth/AuthenticationInterface.java

[controller-auditreport]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/AuditReport.java
[controller-ballotselection]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/BallotSelection.java
[controller-comparisonauditcontroller]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/ComparisonAuditController.java
[controller-contestcounter]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/ContestCounter.java
[controller-deletefilecontroller]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/DeleteFileController.java
[controller-importfilecontroller]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/controller/ImportFileController.java

[csv-coloradoballotmanifestparser]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/csv/ColoradoBallotManifestParser.java
[csv-dominioncvrexportparser]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/csv/DominionCVRExportParser.java

[endpoint-endpoint]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/endpoint/Endpoint.java
[endpoint-abstractendpoint]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/endpoint/AbstractEndpoint.java
[endpoint-abstractauditboarddashboardendpoint]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/endpoint/AbstractAuditBoardDashboardEndpoint.java
[endpoint-abstractcountydashboardendpoint]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/endpoint/AbstractCountyDashboardEndpoint.java
[endpoint-abstractdosdashboardendpoint]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/endpoint/AbstractDoSDashboardEndpoint.java

[json-freeandfairnamingstrategy]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/json/FreeAndFairNamingStrategy.java

[math-audit]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/math/Audit.java

[persistence-persistence]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/persistence/Persistence.java
