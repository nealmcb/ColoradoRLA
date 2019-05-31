# Colorado RLA Software - Next steps

Aside from feature work, which you may wish to track separately, there are a
number of improvements that should be made to the software to make it simpler,
faster, and more maintainable.

## Refactoring

### Switching to Spring

#### Spring REST controllers

The equivalent to Spring REST controllers in the Colorado RLA application is the
`endpoint` package, which uses [Spark][sparkjava]. These typically do work
themselves, or invoke a related class in the `controller` package to do the work
on their behalf. If they reach into other parts of the code, those calls should
probably be refactored into a controller method.

When you are dealing with response formats, look at the `json` package. Since
Spring can automatically serialize many objects to JSON, you may be able to
combine an `endpoint` and any `json` that it uses together into a Spring REST
controller.

#### Spring Data

The classes in `model` can remain mostly the same. However, refactoring
persistence logic to use the Repository pattern will require knowing where
persistence calls live. To find these, look in the `query` package or for calls
to methods in that package, then look for calls to the `Persistence` class in
the rest of the codebase, but specifically in the `controller` and `endpoint`
packages. This method will not be bulletproof, but should get you started.

First, many of the classes in `query` may lend themselves directly to a
Spring `Repository` class, and may be translated somewhat directly.

Next, identify other calls to `Persistence` that appear to be related. Read the
code to capture the essence of what the call is trying to do and give it a name.
This should make for a decent starting point when pulling this code out into a
`Repository`.

Over time, the code should become more readable as grouped invocations to
persistence-related methods are replaced by more readable `Repository` method
calls.

### Write testable code

One of the major difficulties with the code as written is that business logic
and persistence logic is mixed together, making it very difficult to unit test
business logic independent of the database.

The current architecture is written in an MVC style, with packages named `model`
and `controller`, and the "view" layer in packages like `json`. If you choose to
stick with that architecture, it could be nice to remove direct calls to
Hibernate from the controllers. Refactoring to Spring Data will be helpful here.

[sparkjava]: http://sparkjava.com/
