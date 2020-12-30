---
layout: post
category: gameduino
tags: [gameduino]
---

A few months ago I backed the [Gameduino 3X Dazzler](https://www.crowdsupply.com/excamera/gameduino-3x-dazzler) on [Crowd Supply](https://www.crowdsupply.com) and it arrived in time for Christmas 2020.  So, this year isn't all bad, at least one good thing happened!  I've spent a couple days playing with the Dazzler and trying to get my bearings on this device.  It has definitely been a learning experience--being about 10 years since I last looked at anything Arduino-like!  I thought I'd share some notes as I try to figure things out.  *If you have suggestions or corrections, please send them on--I'm just learning!*

I ordered the *Python Game Pack* which is a (1) Dazzler Arduino Shield, (2) an Adafruit Metro M4, (2) a 16 GB microSD card, and (3) two Wii Classic-compatible controllers.  This seemed like a fun way for my son & I to create some fun 'old school' multiplayer games.  

When it first arrived, we assembled the Gameduino to the Metro M4 and plugged it in (HDMI to TV and USB to a power supply), but the first two TVs we tried (an older 27" Visio & a brand new Samsung Frame TV) did not register any signal at all--oh no!  Trying on a 3rd (Sharp) TV worked--*whew*!   Afterwards, trying on normal monitors--every one I've tried seems to work just fine.  TVs are a bit more finicky for some reason.  

It boots up with menu display showing *pong*, *fruit* and *temperature*.  Sure enough, using the Wii controller allows you to choose & play Pong almost like it is 1972 again.  Well, not really, this Pong is MUCH higher resolution, and for some reason [the scoring is backwards](https://github.com/jamesbowman/py-bteve/issues/1).  Well, this just gives an excuse for editing & fixing the included code!

*Fruit* is a fun variant of the "match 3 or more" icons, they disappear and new random icons drop from the top.  *Temperature* shows a graph of the CPU temperature.

The system is running [CircuitPython](https://learn.adafruit.com/adafruit-metro-m4-express-featuring-atsamd51/what-is-circuitpython) which is a new environment for me.  When it boots up, it looks for a `code.py` file and executes it.  If I plug the USB from the Metro M4 to my Windows laptop, the M4 appears just like a USB drive, you can see the files:  `code.py, pong.py`, etc.  Now, I could look over & understand the code.  To me, it is straightforward to understand how it works, so far.  

Reading about CircuitPython, it encourages you to use a dedicated editor to be sure files are saved properly (not cached) for a USB drive, so I installed & used [Mu](https://codewith.mu/).

Mu also allows you to bring up a Python REPL & see version info. Editing with Mu is a simple affair and the CircuitPython environment detects file changes & reloads automatically.  Quite nice!  I was able to change the pong scoring to match my sensibilities and change paddle & background colors, etc.  Just to play with the basics.

The Gameduino CircuitPython is at [https://github.com/jamesbowman/py-bteve](https://github.com/jamesbowman/py-bteve).  I don't quite grok how this repo becomes something that you can install as a CircuitPython or how you install new Python  modules, but its on my list.

Next, I wanted to figure out how to get an Arduino IDE program compiled and installed.  This CircuitPython setup was nice, but I was confused as to how the Arduino IDE would fit in.  Eventually, I read about the [UF2 Bootloader](https://learn.adafruit.com/adafruit-metro-m4-express-featuring-atsamd51/uf2-bootloader-details) which controls how the device boots up.  Currently, it was booting into CircuitPython (you see `D:\CIRCUITPY` on USB), but you can double-click to get it into a different *bootloader* mode.  Here you see `D:\METROM4BOOT` and if you copy a `FILENAME.UF2` file to that drive it reboots with that image running.

So, I learned that **you want to back up & save** the existing `D:\METROM4BOOT\CURRENT.UF2` as that contains the Gameduino CircuitPython boot setup.  I also saved the `D:\CIRCUITPY` drive.  I actually don't quite understand how those differ--this is on my list of things to figure out.  If you copy that saved `CURRENT.UF2` file to the `D:\METROM4BOOT` it then reboots into Gameduino CircuitPython again.

With those backed up and also following [Adafruit's suggested update of the UF2 Bootloader](https://learn.adafruit.com/adafruit-metro-m4-express-featuring-atsamd51/update-the-uf2-bootloader) I felt confident to try the Arduino IDE.

Working through the [setup instructions for Arduino](https://learn.adafruit.com/adafruit-metro-m4-express-featuring-atsamd51/setup) and running a simple LED blink example, what happens is the IDE sets a new UF2 image and boots your device to run the Arduino code.  Now, the G3X does not appear as a USB filesystem any longer.  But, if you double-click the reset button, the `D:\METROM4BOOT` appears and you can copy your backup `CURRENT.UF2` file to that drive to get back to CircuitPython mode.

As you can see I'm just learning the basics, but now I feel like I have my bearings.  I'm hopeful this could be helpful to others who might be in a similar situation.  Next, I hope to make some sort of 2-player tank game and [get Asteroids running](https://tinyletter.com/jamesbowman/letters/asteroids-fully-resurrected)!