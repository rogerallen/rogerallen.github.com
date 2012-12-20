Title: How I made this
Date: 2012-11-25 22:20
Tags: pelican
Category: blog
Slug: how-i-made-this
Author: Roger Allen
Summary: How I'm using Pelican to create this site.

After a short search, I settled on Pelican as a blog creator since I
don't really care to upgrade my ruby install on the Mac to run Jekyll.
These sites were useful to me.

* [http://docs.getpelican.com/](http://docs.getpelican.com/)
* [http://martinbrochhaus.com/2012/02/pelican.html](http://martinbrochhaus.com/2012/02/pelican.html)

I created the site within a "source" subdirectory since I didn't want
yet another repo for the blog source.  I used pelican-quickstart to
fill in the basic configuration.  But, this will publish the output to
the wrong place for serving on github.  So, I had to edit the
OUTPUTDIR to point one directory up in both the Makefile and
develop_server.sh.  This also wreaks havoc with the make clean command
so I updated that bit, too. 

We'll see how well it works to have the source & output
[mis]configured like this.  It might be a bad idea...

To run things locally, I do:

    :::bash
    # get into source
    cd rogerallen.github.com/source
    # to create the initial site
    make html
    # to automatically reload the site & serve on localhost:8000
    make devserver
    # and when you are done.
    ./develop_server.sh stop

I'm going to try publishing things as-is and fix up themes & such later.

*Update 12/19/2012*

I installed https://github.com/getpelican/pelican-themes in
parallel to the blog git repo. I looked into the different themes and
the reasonable choices seemed to be: basic, bootstrap2, tuxlite_tbs,
waterspill-en

    :::bash
    THEME = '../../pelican-themes/tuxlite_tbs'

I think this will work out better.  I also added a pages directory and I see the "about me" getting generated. 

Now for some actual content.
