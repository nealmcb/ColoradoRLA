# Load test scripts
There are two aspects of load testing that are supported here. They are the many
request of polling clients, and the handling of large Cast Vote Record imports.
This technique uses the scripts `../setgo.sh` and `../genrun.sh`, which is a
wrapper around the python project "smoketest" adjacent to this directory.

## polling load test

This test is designed to mimic the maximum possible production load of polling
requests. This could possibly, but not likely, happen if all counties are
starting the audit at the same time.


In one terminal, start the server with a clean slate:

`../setgo.sh`

In another terminal, upload generated CVRs for the first 3 counties:

`../genrun.sh import -c 3`

Define the audit and audit Round 1

`../genrun.sh init`
`../genrun.sh startRound`


Mimic the audit boards polling the dashboard, 3 per county(30second / 3 = 10
second pauses (-p)):

cat admins.txt | xargs -n 1 -P 64 ./polling.sh -p 10 -n 10



## large imports load test

Counties can have as much as half a million Cast Vote Records to upload into the
system. In order to test the system with that much data, we will generate fake
data and audit it.

In one terminal, start the server with a clean slate:
`../setgo.sh`

Then in another, generate, import, and audit using `../genrun.sh`

1) Change the variable `contests` in `../genrun.sh`. (There is an example you can
use that is commented out)

2) Import the generated data for all 64 counties
`../genrun.sh import -c 64`

3) Initialize the audit. You can change the risk limit by changing the variable
`riskLimit` in the `init()` function in `../genrun.sh`

`../genrun.sh init`

4) Start the round/audit. You can change how many contests are audited by
changing `numTargeted` in the `startRound()` function in `../genrun.sh` 

`../genrun.sh startRound`

5) Perform the audit. This will audit all the ballots by getting the next ballot
and submitting an audited ballot with no discrepancies by matching the data. It
is possible to create discrepancies, though it is a little tricky. Look into the
discrepancy plan in `../smoketest/main.py`. You may need to change the round by
hand by changing the `round` variable in the `performRound` function of
`../genrun.sh`

`../genrun.sh performRound`
