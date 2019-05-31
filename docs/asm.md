# Colorado RLA Software Concepts: Abstract State Machine

## Prerequisites

Before reading the rest of the article, make sure you are familiar with what a
[Finite State Machine][fsm-wiki] is. For the purposes of this document, you can
think of an abstract state machine and a finite state machine as interchangeable
since we are only discussing software states and the transitions between them.

## Why Abstract State Machines?

The approach may be unusual to many programmers who have not encountered formal
methods in their careers. One of the properties of these machines is that they
can be used to formally verify software algorithms. In other words, if you can
express an algorithm or a process using a state machine, you may be able to
check up front that the algorithm runs to completion without unexpectedly
terminating, throwing unexpected exceptions, or having undefined behavior.

Without having discussed this with the original authors of the software, it is
reasonable given their background in formal methods that they would start out by
expressing the behavior of the audit software using one or more abstract state
machine, and base any correctness proofs of the audit logic on that state
machine. This would serve to give some confidence that there were no "missing
cases," since all states and transitions between them (i.e. audit boards signing
in and out, whether the audit is active or not) would be fully defined and thus
form a model that could be checked by software such as TLA+.

The rationale for formal methods, especially as it pertains to the original
authors' philosophy on the relationship between writing tests and formal
methods, is further elaborated on by Free and Fair in their
[Validation and Verification][f-and-f-v-and-v] documentation.

### Drawbacks

As the software grows more complex and interactions become more nuanced, it is
harder to express the behavior of the software with a state machine. As the
number of states in the system grows, the interconnections between them (state
transitions) generally grow at a much faster rate. As a result, there are many
behaviors of the system that are not reflected in the abstract state machine.
This puts the software in an awkward position: since much of its behavior was
based on formal specification and lacked less formal (but maybe more
traditional) unit tests, much of the software's behavior ended up simultaneously
untested but also not part of the formally-verified model.

The lack of tests introduced up front made introducing tests for the server-side
API later on more difficult, as much of the testable business logic is wrapped
up with database persistence via Hiberate.

## The Abstract State Machines

In the code, the state machines and their transitions are defined in the
`us.freeandfair.corla.asm` package in the server-side codebase.

There are three separate state machines which interact with each other and are
used throughout the system to drive the audit. Much of the code on both the
front- and back-ends is devoted to checking and updating these states, and many
of the audit processes are only possible when the system is in a specific state.
These three separate state machines are:

- State [Dashboard][dashboard]
- County [Dashboard][dashboard]
- Audit Board [Dashboard][dashboard]

By way of introductions, the following sections of code are worth reading first:

- [ASMState.java][asmstate-java] contains the ASM states for the three state machines: the
  audit board dashboard, the county dashboard, and the state dashboard.
- [ASMEvent.java][asmevent-java] contains the events that are emitted by the
  system which transition the three ASMs through different states. In other
  words, these are the "verbs" while the states are the "nouns".

Please note that the ASM state is persisted in the database since it is crucial
to driving the audit.

[asmstate-java]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/asm/ASMState.java
[asmevent-java]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/asm/ASMEvent.java
[dashboard]: dashboards.md
[f-and-f-v-and-v]: ../freeandfair/40_v_and_v.md
[fsm-wiki]: https://en.wikipedia.org/wiki/Finite-state_machine
