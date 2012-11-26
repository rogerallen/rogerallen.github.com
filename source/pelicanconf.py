#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = u"Roger Allen"
SITENAME = u"Roger Allen's Github Site"
SITEURL = ''

TIMEZONE = 'US/Pacific'

DEFAULT_LANG = 'en'

# Blogroll
LINKS =  (('Pelican', 'http://docs.notmyidea.org/alexis/pelican/'),)

# Social widget
SOCIAL = (('@RogerAllen on twitter', 'https://twitter.com/RogerAllen'),)

DEFAULT_PAGINATION = 10

ARTICLE_URL = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/'
ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/index.html'
