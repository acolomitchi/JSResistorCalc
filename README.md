# JSResistorCalc
Calculator for a combination of resistors having a value as close as possible to a specified one.

Uses:
- JavaScript and JQuery
- JavaScript workers to perform the computations on separated threads
- Heavy use of functional programming, JavaScript style.

See [LICENCE.html](the license - CC-BY-*NC*).

## User guide
Enter the resistor value you need in Ohms (sorry, no unit parsing/converter now), pick your maximum number of resistors in the combination, choose the resistor series available from which
to pick the resistors in the combination, hit the "Compute" button.

*Notes*:
* Every additional resistor in the combination will improve
  the closeness of the result by two orders of magnitude, but it will
  take longer to scan the possible combination. The computation time
  is why "E12" series allows you to ask for combinations of max 4 resistors 
  (0.0001%=1e-6 relative precision), but the "E24" will allow you to
  go only with max 3 (roughly 0.0005%=1e-6 relative precision)</p>
* Mind you, the closeness of the combination value to your required one
  doesn't guarantee that you'll actually obtain that value using
  resistors with a tolerance of &plusmn;10% (E12) or &plusmn;5% (E24).
