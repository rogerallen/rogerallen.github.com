---
layout: post
title: Creating Distortion in Overtone
category: overtone
tags: [overtone, guitar, distortion]
---

I recently created [a guitar
synthesizer](http://github.com/overtone/overtone/blob/master/src/overtone/synth/stringed.clj)
for the [Overtone](http://overtone.github.com/) project.  It started
out as some code in my [explore_overtone
project](http://github.com/rogerallen/explore_overtone) before it was
merged into the main project.  This was a really fun project and I'm
pleased with the results, but one of the pieces that gave me some
trouble was a proper "distortion" sound.  I really wanted that kind of
"real-world" sound.  I think it is something that people might be
surpised to hear from a computer-generated audio synthesizer.  I
posted a query to [this overtone forum
thread](http://groups.google.com/forum/?fromgroups=#!searchin/overtone/distortion/overtone/CQbsKxjEQvc/XGeNOc3XbL4J). After
we resolved this issue Sam Aaron suggested I write up something
describing the process I went through.  In this post, I'll try to
explain.

Initially, I was able to get the guitar to work as an acoustic easily
enough.  I made 6 "string" synths and mixed them together in an "amp"
synth.  You can see on [line 71 of the code from that
time](http://github.com/rogerallen/explore_overtone/blob/a6954fae151743d77be87231cebb8232d15da8bf/src/explore_overtone/guitar.clj#L71)
that the <code>guitar-string-synth</code> synth uses a Karplus-Strong
<code>pluck</code> ugen driven by some <code>pink-noise</code>
stimulus.  This is the very basic method I read about and produces a
nice-enough nylon string output.  Here is what a series of E chords
sounded like.

<audio controls="controls" height="40" width="100">
  <source src="/assets/audio/guitar-e-chord.mp3" type="audio/mp3">
  <source src="/assets/audio/guitar-e-chord.ogg" type="audio/ogg">
  <embed height="40" width="100" src="/assets/audio/guitar-e-chord.mp3">
</audio>

I added distortion with the code from the
[fx-distortion2](https://github.com/overtone/overtone/blob/7d9ae954b23cdfff6a889184942a3d449ea8d5c5/src/overtone/studio/fx.clj#L96)
ugen and you can see it on [lines
99-101](http://github.com/rogerallen/explore_overtone/blob/a6954fae151743d77be87231cebb8232d15da8bf/src/explore_overtone/guitar.clj#L100)
in the "amp" synth section.  This distortion function sends positive
input signal values towards +1.0 and negative values towards
-1.0. This amplifies and distorts the input wave.  A larger distortion
parameter moves more and more of the wave to +/-1.0.

The following function graph hopefully shows this clearly.  X is the
input value and Y is the distorted output after the function is
applied.  There are 3 example lines shown, with different distortion
amounts.  The 45 degree Y=X line is a distortion amount of 0.0.  With
0.25 as the amount, the line is curved a bit away from the straight
line.  At 0.9, the function dramatically pushes all values well away
from their input value.

![distortion_function](/assets/image/distortion-function.png){:width="718px" height="553px"}

So, a small sine wave input would have the tops of the sine wave
exaggerated into a larger, more square-ish wave output.  With this
squaring-off of the input, higher frequency overtones are added and
you get the signature distortion sound.

Frustratingly, this function wasn't working for me.  I could not seem
to keep the distorted sound volume level.  Instead of a loud,
aggressive sound, it got quiet or muddy when enough chords were played
in sequence.  Listen to how it starts off sounding good and quickly
becomes quite frustrating...

<audio controls="controls" height="40" width="100">
  <source src="/assets/audio/guitar-distort-0.mp3" type="audio/mp3">
  <source src="/assets/audio/guitar-distort-0.ogg" type="audio/ogg">
  <embed height="40" width="100" src="/assets/audio/guitar-distort-0.mp3">
</audio>

Curiously, letting the instrument rest for 30 seconds brought it back
to being useful.  But, that was not acceptable, it was just a
workaround.  This was teasing me with the potential for something
really cool--but just out of my reach.

After I posted my frustration to the forum it dawned on me to take a
look at the wave file in Audacity...

![e-chord wave](/assets/image/guitar-e-chord-wav.png){:width="645px" height="141px"}

Looking at the image gave me a hint to what was going on--can you see
it?  Let's take a look at the distored output, too.  *Yes, the wav
files don't line up exactly. I created these sounds live.*

![e-chord distort wav](/assets/image/guitar-distort-0-wav.png){:width="513px" height="143px"}

Now, I knew what was happening.  Apparently, there is some sort of "DC
bias" creeping into the waveform from the <code>pluck</code> ugen over
time.  You can see in the first image that the acoustic waveform is
entirely above the 0.0 line, by the 3rd chord. This doesn't affect the
acoustic audio too much, but it wreaks havoc on the distortion
function.

Since both the high *and* low points of the wave were positive, the
distortion function was mapping all the positive values towards
1.0. This had the effect of *reducing* the amplitude change of the
distorted wave.  So, the sound became quieter instead of louder.

So, I needed something to remove the DC bias.  In the forum, Sam Aaron
pointed me towards the <code>leak-dc</code> ugen.  I was able to give
it a try and it fixed the problem perfectly.  You can see the [code
change
here](http://github.com/rogerallen/explore_overtone/commit/97a91d7d84b627cb1e0fd579ff287c4403e29de9#src/explore_overtone/guitar.clj.
) With this, I finally had the aggressive, distorted sound I was
looking for.  Did you think that a computer synth could sound like
this?

<audio controls="controls" height="40" width="100">
  <source src="/assets/audio/guitar-distort-1.mp3" type="audio/mp3">
  <source src="/assets/audio/guitar-distort-1.ogg" type="audio/ogg">
  <embed height="40" width="100" src="/assets/audio/guitar-distort-1.mp3">
</audio>

And you can see that the waveform looks balanced here:

![e-chord distort wav](/assets/image/guitar-distort-1-wav.png){:width="443px" height="140px"}

I'd like to thank everone on that forum post for all their help.  It
was a nice project to create this instrument, learn about Overtone,
learn about sound synthesis and I hope people use it to have fun &
create some awesome music.

If you want to play with the guitar synth, it is in the 0.8.0 Overtone
branch (soon to be a release.  There are some [demonstration examples
here](https://github.com/overtone/overtone/blob/master/src/overtone/examples/instruments/guitar_synth.clj.
) If you have suggestions or happen to know about properly modelling a
guitar, let me know.  I'd love to hear ideas on how to improve the
synth.
