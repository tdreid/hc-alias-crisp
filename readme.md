# Alias #

A simple HipChat add-on that supports group mentions via room notifications.
# Commands #

```
#!html
usage: /alias [-h] {list,set,remove,show} ...
positional arguments:
  {list,set,remove,show}
                        Available commands
    list                List existing aliases
    set                 Sets a group mention alias
    remove              Removes a group mention alias
    show                Shows the names for an existing alias
optional arguments:
  -h, --help            show this help message and exit

```
Example:
```
#!html
/alias set @ateam @bob @anne @alex

```
Mentioning ateam in a room will return another notification that mentions Bob, Anne and Alex.



### [Install me](https://hipchat.com/addons/install?url=https%3A%2F%2Fhc-alias.herokuapp.com) ###