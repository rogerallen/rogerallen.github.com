---
layout: post
category : overtone
tags : [overtone, diffeq]
---
by Roger Allen & Tony Grabowski

Given a two-dimensional system of beats and time, where $b$ is the beat, and $t$ is the time. Then,
$\frac{\partial b}{\partial t}$ is the instantaneous tempo we will call $v$.

<p>A simple linear change in tempo is where $v_0$ is the tempo at $b_0$
and
$v_1$ is the tempo at $b_1$.  This is described by the differential equation</p>

<p style="font-size: 125%;" >
\begin{equation}
\frac{\partial b}{\partial t} = v_0 + \left( \frac{ v_1 - v_0 }{ b_1 - b_0 } \right) ( b - b_0 )
\end{equation}
</p>

Using [separation of
variables](http://en.wikipedia.org/wiki/Separation_of_variables) and
solving $b = f(t)$ gives the beat as a function of the time $t$

<p style="font-size: 125%;" >
\begin{equation}
b = b_0 + v_0 \left( \frac{ b_1 - b_0 }{ v_1 - v_0 } \right) \left[ e^{t\left( \frac{ v_1 - v_0 }{ b_1 - b_0 } \right)} - 1 \right]
\end{equation}
</p>

and rearranging for the current time $t = g(b)$ gives the time as a function of the beat $b$

<p style="font-size: 125%;">
\begin{equation}
t = \left( \frac{ b_1 - b_0 }{ v_1 - v_0 } \right) \ln{\left[ 1 + \left( \frac{ b_1 - b_0 }{ v_1 - v_0 } \right) \left( \frac{ b - b_0 }{ v_0 } \right) \right]}
\end{equation}
</p>

Given that this is the simplest type of tempo change, you can see that
it is no simple matter to move back and forth between beats and times
when you have a song with a tempo that varies.  This is something that
needs to be considered when programming the performance of music.
