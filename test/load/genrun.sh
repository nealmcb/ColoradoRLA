#!/bin/bash

set -m #job control

# no whitespace in names, not sure how to support that yet...
# TODO: split by newline somehow
counties=( adams
           alamosa
           arapahoe
           archuleta
           baca
           bent
           boulder
           broomfield
           chaffee
           cheyenne
           clear-creek
           conejos
           costilla
           crowley
           custer
           delta
           denver
           dolores
           douglas
           eagle
           elbert
           el-paso
           fremont
           garfield
           gilpin
           grand
           gunnison
           hinsdale
           huerfano
           jackson
           jefferson
           kiowa
           kit-carson
           lake
           la-plata
           larimer
           las-animas
           lincoln
           logan
           mesa
           mineral
           moffat
           montezuma
           montrose
           morgan
           otero
           ouray
           park
           phillips
           pitkin
           prowers
           pueblo
           rio-blanco
           rio-grande
           routt
           saguache
           san-juan
           san-miguel
           sedgwick
           summit
           teller
           washington
           weld
           yuma);

# num ballots, margin for county, rest are margins for state-wide
# remember to calculate margin by multiplying counties by ballot count for a total
small=(64000 450 450 450);

function import() {
    trap exit INT #easy quit
    countyId=1;
    for county in ${counties[*]}; do
            echo "importing county ${countyId} ${county[0]}";
            # cvrFile=cvr-${county[0]}.csv;
            # manifestFile=manifest-${small[0]}.csv
            cvrFile=2018-general-mock-cvrs/${county[0]}-cvr.csv;
            manifestFile=2018-general-mock-cvrs/${county[0]}-manifest.csv;
            # ballotCount=${small[0]}
            # sed "s/{ballot-count}/${ballotCount}/g" > $manifestFile < manifest-template.csv
            # ../smoketest/genelect.py ${small[*]} --county ${county[0]} > $cvrFile;
            ../smoketest/main.py -c $countyId county_setup -f $cvrFile -F $manifestFile;
            # rm $cvrFile;
            # rm $manifestFile;
            ((countyId++));
            if [ $countyId -gt $counties_todo ]; then
                echo "done"
                exit 0
            fi
    done
}

function init() {
    echo "defining audit partially";
    # ../smoketest/main.py dos_init -r 0.01;
    ../smoketest/main.py dos_init;
}

function reset() {
    echo "deleting all data";
    ../smoketest/main.py reset;
}

# start audit by starting round 1
function startRound() {
    echo "starting the round";
    #-1 means all contests
    ../smoketest/main.py dos_start -C '-1' --debuglevel 21;
}

function performRound() {
    trap exit INT #easy quit
    countyId=1; # db ids start at 1
    for county in ${counties[*]}; do
        echo "executing audit for county ${county}";
        # -p discrepancy plan -1 1 means no discrepancies, -R 1 means one round
        ../smoketest/main.py -c $countyId -p '-1 1' county_audit -R 1 -d 25;
        ((countyId++));
        if [ $countyId -gt $counties_todo ]; then
            echo "done"
            exit 0
        fi
    done
}


function help() {
    echo "$0 { import [-c] | init | startRound | performRound }"
    echo "    (run in this order: import > init > startRound > performRound)"
}

counties_todo=1;

function parseArgs() {
    while [ "$#" -gt 0 ]; do
        case "$1" in
            -c) counties_todo="$2"; shift 2;;
            -h) help
                exit 1;;

            --counties=*) name="${1#*=}"; shift 1;;
            --counties) echo "$1 requires an argument" >&2; exit 1;;
            --help) help; exit 1;;
            -*) echo "unknown option: $1" >&2; exit 1;;
            *) echo "unknown option: $1" >&2; exit 1;;
        esac
    done
}

function main() {
    subcommand=$1;
    shift
    parseArgs $@;
    case "$subcommand" in
        import)
            import
            ;;
        reset)
            reset
            ;;
        init)
            init
            ;;
        startRound)
            startRound
            ;;
        performRound)
            performRound
            ;;
        *)
            help $@;
            exit 1;
    esac
}


main $*
