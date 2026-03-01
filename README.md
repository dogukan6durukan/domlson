# DOMLSON 
DOMLSON is a configuration language mixed of both yaml and json.
Works perfectly with JavaScript.

Features having right now:
- Definition of both string, number, boolean and, array values.
- Can read domlson from external `.dms` extension file.
- Comment lines
- Error message
- Reference
- Variables

Features wish to add:
- Nested Objects

## Example usage
```
@user
name : "Dogukan"
age : 19
student : true
results : [55, "meh", false]

# comment line - below is also comment
# student : false


@student 
name : "John Cena"
# Reference to a user object and reference to it's age, student value 
age : user.age
student : user.student
results : [85, "fine", true]
```