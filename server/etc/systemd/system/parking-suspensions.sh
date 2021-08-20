#!/bin/bash
# title: Retrieve parking suspensions as HTML pages from camden.gov.uk
# author: Stephen Taylor
# date: 20  Aug 2021
# DRY: Don't Repeat Yourself
# usage: run as root

url="http://registers.camden.gov.uk/SuspendedBays/Suspensions.aspx"
dest="/var/www/hillsiders.org/data"

srcs=('NASSINGTON%20ROAD' 'PARLIAMENT%20HILL' 'SOUTH%20HILL%20PARK' 'TANZA%20ROAD')

lst=$((${#srcs[*]} - 1))

rm -f $dest/table.html
for i in `seq 0 $lst`
do
    echo ${srcs[$i]}
    src="$url?street=${srcs[$i]}"
    curl -s $src | grep -h '<t[rd]>' >> $dest/table.html
    if [ $? -eq 0 ]
    then
        echo  "Copied from $src"
        continue
    else
        echo "Could not write table file" >&2
        exit 1
    fi
done

echo "All done"
exit 0
