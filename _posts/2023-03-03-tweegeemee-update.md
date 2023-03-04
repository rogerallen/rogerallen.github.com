---
layout: post
category: tweegeemee
tags: [tweegeemee, digital-ocean, python, django, postgresql, clojure]
---

Since 2015 I've been running a bot on Twitter that creates evolutionary imagery based on favorites & retweets as a fitness score. The bot is called "tweegeemee" and you can find it at [https://twitter.com/tweegeemee](https://twitter.com/tweegeemee).

Over the past few months, I was motivated to start diversifying my bot to no longer be only reliant on one social network. Now tweegeemee runs on Mastodon at [https://botsin.space/@tweegeemee](https://botsin.space/@tweegeemee) and on Tumblr at [https://tweegeemee.tumblr.com/](https://tweegeemee.tumblr.com/) (I'd love to make an Instagram variant, but that seems against the rules.) I started to think about making this work on reddit (see [https://reddit.com/r/tweegeemee](https://reddit.com/r/tweegeemee)), but I'm not convinced it is a fit for reddit.  If you disagree, feel free to add a comment on [this thread](https://www.reddit.com/r/tweegeemee/comments/ztq7kl/thread_for_interest_in_developing_this_area/).

In January 2021, I expanded beyond the bot and created a website [https://tweegeemee.com/](https://tweegeemee.com/) where you can browse & explore the current image gene pool, "Top 10" and "Best Of" imagery there. If you click into an image, you can see details like the code that created it and follow that to an ancestry/genealogy diagram. This has been [running on Digital Ocean](https://m.do.co/c/c62ce16b2041) and has been a fun learning experience for me.

To go back to what motivated me to expand beyond Twitter, there were a few reasons...

First, I have always been a little nervous about having my bot only on one platform.  

Second, there was an incident in October 2022 that took the account offline for about two weeks for no explicable reason.  First tweet about this was on [October 9, 2022](https://twitter.com/RogerAllen/status/1579133051925585920), followed by weeks of a [very frustrating experience](https://twitter.com/RogerAllen/status/1581310583856844800) and only with [the help of a Twitter Developer advocate](https://twitter.com/lebraat/status/1579894847372431361) was I [eventually reinstated on October 20, 2022](https://twitter.com/RogerAllen/status/1583137577049419776).  They did apologize in email & noted that the account had done nothing wrong.

Third, Elon Musk took over Twitter in November, 2022 and immediately started reducing staff, including my helpful devloper advocate.  Then came erratic changes like banning links to alternative sites in mid-December, 2022.  The craziness from Elon continued on Feb 2, 2023 with *one week notice* they [suggested that the free API that tweegeemee relied on was going away](https://twitter.com/tweegeemee/status/1621358019098611712).  Much angst followed until Feb 8 when the rule changes were adjusted such that tweegeemee fit into the rules. If the past is any guide, there will be more challenges ahead...

After the mid-December kerfluffle, I started working in earnest to diversify. By December 26, I had a Mastodon bot working.  I continued looking around & [noted that Google Trends showed Tumblr has more interest than Mastodon](https://twitter.com/RogerAllen/status/1621289207372349441), so by February 4, [I had Tumblr going](https://twitter.com/tweegeemee/status/1622037700621795330).  I'm very happy that I did diversify.  It gives me confidence that tweegeemee might live a long life.

If you have suggestions for other social sites to consider, please reach out.

I hope you will consider following one or more of the bots and participate in tweegeemee's evolutionary art generation.