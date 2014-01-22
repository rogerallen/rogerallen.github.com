---
layout: post
category: overtone
tags: [overtone, synth-design]
---

This all started when I heard the phrase "detuned saw" describing an
older synth sound and wanted to understand what that really
meant. Along the way, I think I've recreated a typical saw synth from
some early 80's keyboards.  It isn't that amazing, but by building it
up piece-by-piece, I think it is interesting to see how the sound is
built up.

I've played with synth design before in Overtone, but was a bit
frustrated with controlling all the parameters that a typical synth
seems to end up with.  Just in time, XX YY fixed up the GUI libraries
for Overtone and added a dead-simple way to get a simple window with
sliders to allow for easy exploration of the parameter space.

## Step 1

First, let's create and listen to what a basic sawtooth wave sounds like.

```clojure
 (defsynth saw-synth-1
    "a basic saw synth"
    [pitch-midi {:default 60  :min 40   :max 70  :step 1}
     gate       {:default 1.0 :min 0.0  :max 1.0 :step 1}
     position   {:default 0.0 :min -1.0 :max 1.0 :step 0.1}
     out-bus    {:default 0   :min 0    :max 128 :step 1}]
    (let [pitch-freq (midicps pitch-midi)
          saw-out (saw pitch-freq)]
      (out out-bus (pan2 (* gate saw-out) position))))
```

The input parameters each have a map with :default, :min, :max and
:step to help the GUI code to draw proper sliders to control our
synth.  Going through the code, we convert the <code>pitch-midi</code>
input integer to a frequency and use the <code>saw</code> ugen to
produce the waveform.  After that, a multiply by the <code>gate</code>
parameter gives on/off control.  You can use the <code>position</code>
parameter to place the sound in the stereo field.  Finally, the
<code>out-bus</code> param tells us where to send our synth
waveform. Typically, 0 is to your default output & speakers.

Here you can hear me play with pitch-midi, position and gate.

 <audio controls="controls" height="40" width="100">
   <source src="/assets/audio/saw-synth-1-play.mp3" type="audio/mp3">
   <source src="/assets/audio/saw-synth-1-play.ogg" type="audio/ogg">
   <embed height="40" width="100" src="/assets/audio/saw-synth-1-play.mp3">
 </audio>

And here is an image of what the waveform looks like in the
oscilloscope.  The scope in explore_overtone has a couple useful extra
features for this excercise.  First, I added a trigger level to make
the waveform stable.  Second, it displays both the left and right
channel.  Finally, I added a horizontal zoom.

##FINISH ME
