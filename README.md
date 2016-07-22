# JSResistorCalc
Calculator for a combination of resistors having a value as close as possible to a specified one.

Uses:
- JavaScript workers to perform the computations on separated threads
- JQuery and JQUeryUI for the UI controller
- Heavy use of functional programming, JavaScript style.

An online accessible version is already available at:
http://caffeineowl.com/electronics/calcs/rescomb/

See [LICENCE.html](the license - CC-BY-*NC*).

## User guide
Enter the resistor value you need in Ohms (sorry, no unit parsing/converter now), 
pick the maximum number of resistors in the combination,
  choose the resistor values available to make combination 
  (you can even pick custom subsets of E12 or E24),
  adjust the combination type (parallel only, series only or both), 
  hit the "Compute" button.
  
*Notes*:
<ol>
  <li> Every additional resistor in the combination will improve
  the quality of the resulted values by roughly two orders of magnitude. 
  However asking for combinations made of a higher number of resistors
  will cause longer searches for combinations (an exponential growth).
  The calculator will restrict the maximum number of resistors in combination
  based on the number of the available/input resistor values.<ul>
    <li>For input sets up to 24 values, you can request combinations up to 6 resistors.</li>
  <li>For input sets up to 36 values, the maximum number of resistor in the combination is 5</li>
  <li>For up to 72 input values (full E12 included), combinations up to 4 resistors may be requested</li>
  <li>For more than 72 values, only combinations of 3 resistors will be considered</li>
  </ul>
  <li>
  
<li> Mind you, the closeness of the combination value to your required one
  doesn't guarantee that you'll actually obtain that value using
  resistors with a tolerance of &plusmn;10% (E12) or &plusmn;5% (E24).</li>
</ol>
