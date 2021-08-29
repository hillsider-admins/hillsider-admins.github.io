hillsiders.org
==============


Source files for hillsiders.org.

The `server` folder holds source files for the daemon that scrapes Camden’s parking-suspensions pages.

The `site` folder holds the static HTML website.

A project of the Hills Admins web team.


Parking suspensions
-------------------
On the webserver the table of parking suspensions `data/table.html` is written by a script 

    /etc/systemd/system/parking-suspensions.sh

running every hour. 
For development work use the `table.html` in this repo.