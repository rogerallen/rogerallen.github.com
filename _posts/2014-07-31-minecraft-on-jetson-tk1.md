---
layout: post
category: jetson
tags: [minecraft, linux, ubuntu, lwjgl, openal, nvidia, jetson-tk1]
---

<img src="/assets/image/jetson_minecraft_med.jpg" width="645" height="490" />

Call me crazy, but with an [NVIDIA Jetson
TK1](https://developer.nvidia.com/jetson-tk1) in my hands, the first
thing I wanted to try running was [Minecraft](https://minecraft.net/).
The real Minecraft, not the "Pocket Edition" Minecraft that normally
runs on ARM processors.  It took me a few days to figure out how to
make it happen, but I've now got it running at a very playable 25-30Hz
at 1920x1080.  Hopefully the instructions below can get it working for
you, too.

Just to be clear, you will need to have purchased a Minecraft license
to get this running.

### Install Java

First, Minecraft requires Java.  I found you *must* use Oracle's Java
for reasonable performance--it is 10x faster than OpenJDK Java (2-3fps
vs 25-30fps).  Maybe OpenJDK will see this and use it to tune their
implementation.

Following [these webupd8
instructions](http://www.webupd8.org/2012/01/install-oracle-java-jdk-7-in-ubuntu-via.html)
to install Java worked perfectly for me:

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java7-installer
```

Then, make sure to update your JAVA_HOME directory.  I put this into
my .bashrc:

```
JAVA_HOME=/usr/lib/jvm/java-7-oracle
PATH=${PATH}:${JAVA_HOME}/bin
```

### Build LWJGL

Next, Minecraft requires [LWJGL](http://lwjgl.org/).  Compiling it
requires only one small edit to the code and I was grateful to follow
in the footsteps of [this developer's
instructions](http://it.toolbox.com/wiki/index.php/Developing_on_Raspberry_Pi).

These are the packages I needed installed:

```
sudo apt-get install git ant
sudo apt-get install libxcursor-dev # X cursor management library (development files)
sudo apt-get install libxxf86vm-dev # X11 XFree86 video mode extension library (development headers)
sudo apt-get install libxrandr-dev  # X11 RandR extension library (development headers)
```

Get the LWJGL source from [Github](http://github.com):

```
git clone https://github.com/LWJGL/lwjgl.git
```

There is a bug in the LWJGL linux build in that it assumes an `-L${java.home}/lib/i386`
library path instead of conditionally using `-L${java.home}/lib/arm` libs.  I fixed this
locally with a small edit below while LWJGL works on [Issue
74](https://github.com/LWJGL/lwjgl/issues/74#issuecomment-50048448).

```
$ git diff
diff --git a/platform_build/linux_ant/build.xml b/platform_build/linux_ant/build.xml
index f94b5cb..b0f800c 100644
--- a/platform_build/linux_ant/build.xml
+++ b/platform_build/linux_ant/build.xml
@@ -4,7 +4,7 @@
        <property name="native" location="../../src/native"/>
        <property name="libname32" value="liblwjgl.so"/>
        <property name="libname64" value="liblwjgl64.so"/>
-       <property name="libs32" value="-L/usr/X11R6/lib -L/usr/X11/lib -lm -lX11 -lXext -lXcursor -lXrandr -lXxf86vm -lpthread -L${java.home}/lib/i386 -ljawt" />
+       <property name="libs32" value="-L/usr/X11R6/lib -L/usr/X11/lib -lm -lX11 -lXext -lXcursor -lXrandr -lXxf86vm -lpthread -L${java.home}/lib/arm -ljawt" />
        <property name="libs64" value="-L/usr/X11R6/lib64 -L/usr/X11/lib64 -lm -lX11 -lXext -lXcursor -lXrandr -lXxf86vm -lpthread -L${java.home}/lib/amd64 -ljawt" />
        <property name="cflags32" value="-O2 -Wall -c -fPIC -std=c99 -Wunused"/>
```

Due to a different "apt" binary in both the java sdk and in /usr/bin,
there needs to be something done for your path while you build with
`ant`.  The following worked for me.

```
cd lwjgl
env PATH=${JAVA_HOME}/bin:${PATH} ant
```

The above should build a `lib/liblwjgl.so` native shared library.

### Build OpenAL

For a while, I thought this would be all I needed for LWJGL and I was
confused as to why sound did not work.  But, LWJGL doesn't actually
build `libopenal.so`, it just packages up an x86 shared library.
See https://github.com/LWJGL/lwjgl/tree/master/libs/linux

So, we must build OpenAL.  For this, I needed to get cmake.

```
sudo apt-get install cmake
```

Downloading the source and building was no problem at all:

```
wget http://kcat.strangesoft.net/openal-releases/openal-soft-1.15.1.tar.bz2
tar xvjf openal-soft-1.15.1.tar.bz2
cd openal-soft-1.15.1/build/
cmake ..
make
```

This should create a `build/libopenal.so.1.15.1` native shared library.

### Package Your Native Libs

Now, find a convenient location to store your LWJGL and OpenAL
libraries.  Copy the libraries you've created to that location.  Note
that libopenal.so changes names to drop the version number.

For example: (adjust paths as needed)

```
mkdir -p ~/Minecraft/Natives
cp ~/Dev/openal-soft-1.15.1/build/libopenal.so.1.15.1 ~/Minecraft/Natives/libopenal.so
cp ~/Dev/lwjgl/lib/liblwjgl.so ~/Minecraft/Natives
```

### Preliminary Run of Minecraft

Find the latest Linux `Minecraft.jar` from
[https://minecraft.net/download](https://minecraft.net/download) and
save that in the `~/Minecraft` directory.  Run this via `java -jar
Minecraft.jar` and try to start a game from the launcher window.  It
should download all the files necessary into the `~/.minecraft`
directory in order to run the latest version of Minecraft.  But, it
will complain when it can't find the arm native libraries.  Just quit
after you try to launch a game and it fails.

During this process you should see a lot of output to your terminal.
One piece is the java commandline it uses to start the game from the
launcher.  **I'm sure this commandline will change in the future, so
make note of this and if you are running a version of Minecraft
different than 1.7.10, you will need to adjust.**

I've created a **[gist
here](https://gist.github.com/rogerallen/91526c9c8be1a82881e0) that
has the commandline** I'm using.  Basically, all I did was change the
-Djava.library.path to point to our native libraries and add the last
part of the commandline starting with `--username`.  This last bit is
not listed in the terminal output.  These are additional parameters
that I only found via a [google
search](http://gaming.stackexchange.com/questions/156000/launching-minecraft-1-7-4-from-the-command-line). **Again,
I'm sure these options will change going forward.  As versions change,
perhaps we can work together to maintain these commandlines via the
gist link above.** Who knows, perhaps Mojang will see this and decide
to include arm native libs--wouldn't that be great?

Note that you will have to replace `xxx` and `yyy` in the commandline

```
      --username xxx \
      --accessToken "yyy" \
```

`xxx` is your username that you used to register Minecraft.  The `yyy`
token is from the `.minecraft/launcher_profiles.json` "clientToken".
It is a long string that should have been setup when you did the first
run of minecraft.

### Run Minecraft

Copy the
[commandline](https://gist.github.com/rogerallen/91526c9c8be1a82881e0)
to `~/Minecraft/run.sh` and `chmod +x run.sh`.  Running that file
should allow Minecraft to find the native files and run on your TK1.

Enjoy!
