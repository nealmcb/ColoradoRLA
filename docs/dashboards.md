# Colorado RLA Software Concepts: Dashboards

## Overview

You will encounter the term "dashboard" throughout the software. Aside from its
more well-known meaning as a certain style of user interface that displays
summary statistics about a business or similar, in the Colorado RLA system it
serves as the highest-level "entry point" into three different parts of the
system, divided by the different logical "views" of the system:

- the state of Colorado (CDOS)
- the individual counties in Colorado
- the audit board(s) participating in the audit at each county

In the rest of the document, I will refer to both a **Dashboard UI** and a
**Dashboard model** to distinguish the UI component from the data model.

## Three dashboard models

The dashboard models can serve as a "root" from which to explore the rest of the
data model. When reading the code, it can help to start from one of the
following places in order to understand how the data model is organized from the
perspective of the application.

### State dashboard

- Code: [DoSDashboard.java][dosdashboard-java]

There are references to the "audit info" (summary data about the audit) as well
as the contests currently under audit.

### County dashboard

- Code: [CountyDashboard.java][countydashboard-java]

This class holds references to things like the current round, the rounds
themselves that have taken place or are in progress, the number of samples
audited, discrepancies, disagreements, etc.

### Audit board dashboard

While there is a data model for the audit board itself (holding the members,
sign-in status, etc.), there is no model explicitly associated with the audit
board dashboard. However, in the [ASM][asm], there are audit-board-specific
states and events that are separate from both the state and the county
dashboards.

[asm]: asm.md
[countydashboard-java]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/model/CountyDashboard.java
[dosdashboard-java]: ../../server/eclipse-project/src/main/java/us/freeandfair/corla/model/DoSDashboard.java
