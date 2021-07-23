#!/bin/bash
# title: Retrieve parking suspensions as HTML pages from camden.gov.uk
# author: Stephen Taylor
# date: 11 Jun 2020
# usage: run as root

url="http://registers.camden.gov.uk/SuspendedBays/Suspensions.aspx"
dest="/var/www/hillsiders.org/data"

srcs=('NASSINGTON%20ROAD' 'PARLIAMENT%20HILL' 'SOUTH%20HILL%20PARK' 'TANZA%20ROAD')
tgts=(nass phill south tanza)

lst=$((${#srcs[*]} - 1))

rm -f "$dest/*"
for i in `seq 0 $lst`
do
    echo ${srcs[$i]}
    tgt="$dest/${tgts[$i]}.html"
    curl -s "$url?street=${srcs[$i]}" > $tgt
    if [ $? -eq 0 ]
    then
        echo  "Created $tgt"
        continue
    else
        echo "Could not write $tgt" >&2
        exit 1
    fi
done

rm $dest/table.html
grep -h '<t[rd]>' $dest/*.html > $dest/table.html

if [ $? -eq 0 ]
then
    echo All done
else
    echo "Failed to grep to $dest/table.html" >&2
    exit 2
fi

exit 0
