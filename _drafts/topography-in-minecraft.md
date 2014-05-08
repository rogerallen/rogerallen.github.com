---
layout: post
category: minecraft
tags: [minecraft, scriptcraft, topography, geography, maps]
---

I'm finding [Minecraft](https://minecraft.net/) along with
[ScriptCraft](http://scriptcraftjs.org/) is an excellent way to
motivate my son to learn programming.  [Walter
Higgins](https://twitter.com/walter) has created a fantastic
environment for interacting with the minecraft world.  First steps can
be taken from within the game itself, manipulating blocks to create
houses and geometrical shapes.  Next, you can save your programs as
files and reload the code as you edit it in a text editor.

The best part of ScriptCraft for me was the excellent introductory
documentation.  When I first showed my son the system, I could only
give him the briefest of introductions as I had a phone meeting to
attend.  Then I pointed him at [the Young Person's Guide to
Programming
Minecraft](https://github.com/walterhiggins/ScriptCraft/blob/master/docs/YoungPersonsGuideToProgrammingMinecraft.md#the-young-persons-guide-to-programming-in-minecraft)
and had to call into the meeting.  I was worried that he was going to
get frustrated and give up...but after two hours of meetings he was
still happily exploring and creating houses, spheres and blocks in the
minecraft world--all by himself.  Granted, he has learned some basic
JavaScript before, but it was wonderful that he was able to get going
like this.  The other minecraft mod systems could take a lesson from
this as I find their documentation pretty opaque.

Digital Elevation Models in MineCraft
-------------------------------------

<img src="/assets/image/lakeo_minecraft_med.jpg" width=640" height"384" />

*As you can see, the Minecraft Oregon is nearly indistingushable from
 the actual Oregon*

An idea I've been kicking around for a while is trying to model our
local topography in Minecraft.  With ScriptCraft, it turned out to be
pretty straightforward and I got a request from @walter on twitter to
describe the process.

As an overview, here are the basics:

1. Get the elevation data.
2. Create & crop a greyscale image where the grey level is proportional to the height in your elevation data.
3. Use that greyscale image to also create a material image.  Different colors in this image represent different materials like water, grass, sand, etc.
4. Convert these images to JSON-formatted arrays.
5. Finally, create a ScriptCraft function to use the data in the arrays to create the topography in Minecraft.

<h4>Getting Elevation Data</h4>

blah

<h4>Create Elevation Image</h4>

blah

<h4>Create Material Image</h4>

blah

<h4>Convert Images to JSON</h4>

blah

<h4>Create the ScriptCraft Function</h4>

blah
