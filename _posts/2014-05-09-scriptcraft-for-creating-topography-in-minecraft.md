---
layout: post
category: minecraft
tags: [minecraft, scriptcraft, topography, geography, maps]
---

I'm finding [ScriptCraft](http://scriptcraftjs.org/) is an excellent
way to motivate my son to learn programming.  [Walter
Higgins](https://twitter.com/walter) has created a fantastic
environment for interacting with the
[minecraft](https://minecraft.net/) world.  First steps can be taken
from within the game itself, manipulating blocks to create houses and
geometrical shapes.  Next, you can save your programs as files and
reload the code as you edit it in a text editor.

The most impressive part of ScriptCraft so far is the excellent
introductory documentation.  When I first showed my son the system, I
could only give him the briefest of introductions as I had a phone
meeting to attend.  Then I pointed him at [the Young Person's Guide to
Programming
Minecraft](https://github.com/walterhiggins/ScriptCraft/blob/master/docs/YoungPersonsGuideToProgrammingMinecraft.md#the-young-persons-guide-to-programming-in-minecraft)
and had to call into the meeting.  I was worried that he was going to
get frustrated and give up...but after the meeting he was still
happily exploring and creating houses, spheres and blocks in the
minecraft world--all by himself.  Granted, he has learned some basic
JavaScript before, but it was wonderful that he was able to get going
so easily.  The other minecraft mod systems could take a lesson from
this as I have found their documentation only covers the very basics.

After learning the basics of ScriptCraft, we wondered if we could
recreate our local region in minecraft?

Digital Elevation Models in MineCraft
-------------------------------------

![image_lakeo](/assets/image/lakeo_minecraft_med.jpg){:width="640px" height="384px"}

*As you can see, the Minecraft Oregon is nearly indistingushable from
 the actual Oregon*

With ScriptCraft, the [Geospatial Data Abstraction Library
(GDAL)](http://www.gdal.org) and some basic programming, I was able to
get our local region's topography into minecraft and posted my first
picture on twitter.  After a request from @walter on twitter to
describe the process, I'm writing it down here.

I'm metaphorically standing on the shoulders of Bjørn Sandvik who
wrote [this blog
entry](http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs-part-1.html)
that enabled me to decode the DEM data easily.

Here is the overview of the process:

0. Get the GDAL software package.
1. Get the elevation data.
2. Create & crop a greyscale image where the grey level is proportional to the height in your elevation data.
3. Use that greyscale image to also create a material image.  Different colors in this image represent different materials like water, grass, sand, etc.
4. Convert these images to JSON-formatted arrays.
5. Finally, create a ScriptCraft function to use the data in the arrays to create the topography in Minecraft.

<h4>Getting the GDAL software package</h4>

From Bjørn's site, I discovered the [GDAL](http://www.gdal.org/)
software package.  Happily, it was easily installed on Ubuntu
12.04 LTS via `sudo apt-get install gdal-bin`.

GDAL enables the conversion of elevation files to images.  Images are
easier to use for the rest of the process than the special-format DEM
files.

<h4>Getting Elevation Data</h4>

Of course, you'll need to get the basic topography for your
region. These are found in Digital Elevation data or DEM files.  For
myself, I found [this site for Oregon DEM
files](http://www.oregon.gov/DAS/CIO/GEO/pages/data/dems.aspx) via a
google search.  I believe that DEM files are also available via
[http://earthexplorer.usgs.gov/](http://earthexplorer.usgs.gov/), but
I have not used this service yet.

You will want to know the exact latitude and longitude of the region
you want to model in order to find the DEM file (or files) you need.
As always, Google is your friend here.

After a bit of tedious downloading and looking inside files via the
[gdalinfo](http://www.gdal.org/gdalinfo.html) program, I found that
the data I wanted was in this DEM file:
ftp://159.121.106.159/elevation/DEM/baseline97/rawdems/45122/d/5122d6dg.zip

<h4>Create Elevation Image</h4>

Unzipping the one DEM file I needed, I followed [the steps from Bjørn's site](http://blog.thematicmapping.org/2013/10/terrain-building-with-threejs-part-1.html).

```
# Build a virtual dataset.  (I only used one DEM file)
> gdalbuildvrt lakeo.vrt 5122D6DG

# Convert virtual dataset into a GeoTIFF
> gdalwarp lakeo.vrt lakeo.tif

# Get relevant info from the GeoTIFF file.
> gdalinfo -mm lakeo.tif
# in the output, these lines were the most relevant
Size is 328, 466
Pixel Size = (30.0, -30.0)
Computed Min/Max=0.000,1064.000

# Given the min/max info, scale it to fit in an 8-bit PNG
> gdal_translate -scale 0 1064 0 255 -of PNG lakeo.tif lakeo.png
```

These steps create a 328x466 image where the normal 0 to 1064 meter elevation
is encoded in the greyscale values between 0 to 255.

![image_lakeo](/assets/image/lakeo.png){:width="328px" height="466px"}


I was a bit worried (for good reason, I found later) that a region
this size would take too long to create in minecraft.  Because this is
just a PNG image, I used [gimp](http://www.gimp.org/) to select a
smaller 200x140 pixel area to use.  I just cropped and saved this as
`lakeo_clip.png`.

![image_lakeo](/assets/image/lakeo_clip.png){:width="200px" height="140px"}

<h4>Create Material Image</h4>

At this point, you can create a heightmap of the terrain, but to have
different types of terrain, including water for a lake, you need some
additional data.

By converting this greyscale image to a RGB color image and using the
select-color tool in gimp, I was able to create a 3-color (blue,
green, yellow) map to use for describing the different materials to
place in minecraft.

![image_lakeo](/assets/image/lakeo_clip2.png){:width="200px" height="140px"}

<h4>Convert Images to JSON</h4>

Now, we need to get this image information into a format that is
usable in Javascript.  There are a lot of ways to do this and I chose
to use the python Image module.

```python
#!/usr/bin/python
import Image
import json

# load elevation data
i = Image.open("lakeo_clip.png")
d = i.load()
width = i.size[0]
height = i.size[1]

heightmap = []
for y in range(height):
    hh = []
    for x in range(width):
        # y-invert image
        hh.append(d[(x,height-1-y)][0])
    heightmap.append(hh)

# convert color data to 0,1,2
def color2blk(c):
    if c == (255, 255, 0, 255):
        # yellow = high elevation
        return 2
    elif c == (0, 255, 0, 255):
        # green = low elevation
        return 1
    elif c == (0, 0, 255, 255):
        # blue = water
        return 0
    else:
        print "Bad Color:",c
        assert(0)

# load color data
i2 = Image.open("lakeo_clip2.png")
b = i2.load()
assert i2.size[0] == i.size[0]
assert i2.size[1] == i.size[1]

blockmap = []
for y in range(height):
    hh = []
    for x in range(width):
        # y-invert image
        blk = color2blk(b[(x,height-1-y)])
        hh.append(blk)
    blockmap.append(hh)

data = { "width": width,
         "height": height,
         "elevation": heightmap,
         "blocks": blockmap,
     }

with open('lakeo_clip.json', 'w') as outfile:
    json.dump(data, outfile)

```

Hopefully the code is self-explanatory.  It is just converting the PNG
imagery into 2D arrays and saving them as JSON data.  One thing to
notice is that I y-invert the image.  This is because the JavaScript
code creates terrain assuming the origin is in the lower-left of the
image.  But, the PNG data is stored starting from the upper-left.
Y-inverting fixes this mismatch.

I just copied the relevant parts of the JSON file as text and pasted
it into the JavaScript function described in the next section.

<h4>Create the ScriptCraft Function</h4>

The ScriptCraft function I created to instantiate the elevation data
is [in this
gist](https://gist.github.com/rogerallen/c12450d2dfdc77dd1fd3).  The
interesting part is copied below, but the gist also has the elevation
data stored in the `lakeo_elevation` and `lakeo_blocks` 2D arrays.

The code rasterizes the terrain and creates boxes with 3x3 bases where
the height is derived from the `lakeo_elevation` array.  You can
adjust as you'd like.  Fullscale would have this basic block as 30x30,
but we liked the exaggerated reality of a 3x3 block.

For each type of material, I create a lower layer and a top layer to
give a bit of interest to the topography.  This could certainly be
made more interesting, but this is just V1.0...

```javascript
var lakeo = function() {
    // saves the drone position so it can return there later
    this.chkpt('lakeo');
    var x, y;
    // each block is 3x3.
    var w = 3;
    for(y = 0; y < 140; y++ ) {
        for(x = 0; x < 200; x++) {
            var h = lakeo_elevation[y][x];
            var b = lakeo_blocks[y][x];
            if(b === 0) {
                // water
                var h2 = w*4;
                var h1 = h - h2;
                if(h1 > 0) {
                    this.box(blocks.clay,w,h1,w)
                        .up(h1)
                        .box(blocks.water,w,h2,w)
                        .down(h1);
                } else {
                    this.box(blocks.water,w,h,w)
                }
            } else if(b === 1) {
                // grass-covered block
                var h2 = w;
                var h1 = h - h2;
                if(h1 > 0) {
                    this.box(blocks.dirt,w,h1,w)
                        .up(h1)
                        .box(blocks.grass,w,h2,w)
                        .down(h1);
                } else {
                    this.box(blocks.grass,w,h,w)
                }
            } else if(b === 2) {
                // high grass-covered block
                var h3 = w;
                var h2 = w*3;
                var h1 = h - h2 - h3;
                if(h1 > 0) {
                    this.box(blocks.stone,w,h1,w)
                        .up(h1)
                        .box(blocks.dirt,w,h2,w)
                        .up(h2)
                        .box(blocks.grass,w,h3,w)
                        .down(h1+h2);
                } else {
                    this.box(blocks.grass,w,h,w)
                }
            }
            this.right(w);
        }
        this.left(x*w).fwd(w);
    }
    // return to where we started
    return this.move('lakeo');
};
// Okay this extends the drone object to include this fn
var Drone = require('../drone/drone').Drone;
Drone.extend('lakeo',lakeo);

// ...code continues with the 2D arrays of data...
```

So, with this file in your plugins directory, at this point you should
face toward north, point at a square in front of you and type:

```
/js lakeo()
```

and watch the topography be created.  Be warned, it takes several
hours to finish.  You may want to start small (10x10 instead of
200x140) if you are experimenting on your own.  If anyone has ideas on
how to make this run faster, I'd love to hear about it.

I've dashed this off quickly so I may have missed some details.  I'm
also new to ScriptCraft so I may not be doing something as well as
could be done.  Let me know on twitter if I need to fix something.
But, I hope this shows how you, too, can model your neighborhood
terrain in Minecraft.

Cheers!
