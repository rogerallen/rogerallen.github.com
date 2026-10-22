---
layout: post
title: Tweegeemee Update 2026
category: tweegeemee
tags: [tweegeemee, digital-ocean, python, django, postgresql, clojure]
---

For almost 11 years, I've been running a bot that evolves imagery based on favorites & retweets as a fitness score. The bot is called "tweegeemee". You can find the main website at [tweegeemee.com](https://www.tweegeemee.com) and posts on [Bluesky](https://bsky.app/profile/tweegeemee.bsky.social), [Mastodon](https://genart.social/@tweegeemee), [Threads](https://www.threads.net/@tweegeemee) and [Tumblr](https://tweegeemee.tumblr.com/).  I most recently posted about it [here in 2023](/tweegeemee/2023/03/03/tweegeemee-update), and with one big recent event, it is time for another.

Before I start, to give you an idea of what tweegeemee is capable of, here are a few of my recent favorites.  Click on the images to see details about the code that created them, scores, their ancestry, descendants, and links to the posts, etc.

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; max-width: 50%;">
  <a href="https://tweegeemee.com/i/250806_164643_C" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/25/08/06/164643_C.png" alt="250806_164643_C" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/251018_004505_b" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/25/10/18/004505_b.png" alt="251018_004505_b" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/251124_134356_D" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/25/11/24/134356_D.png" alt="251124_134356_D" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/251222_174923_N" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/25/12/22/174923_N.png" alt="251222_174923_N" style="width: 100%; height: auto; display: block;"></a>
</div>

# So Long, Twitter

A few months ago, X [announced the Launch of X API Pay-Per-Use Pricing](https://devcommunity.x.com/t/announcing-the-launch-of-x-api-pay-per-use-pricing/256476). I wasn't paying attention, and this escaped my notice.  At the end of March, I noticed that images stopped posting to [x.com/tweegeemee](https://x.com/tweegeemee).  Investigating my logs showed `HTTPException: 402 Payment Required. Your enrolled account [redacted] does not have any credits to fulfill this request.`  I have no intention of paying to post, so [this is the final image on X](https://x.com/tweegeemee/status/2035323410923016699).   

Tweegeemee started out on Twitter before it became X, so this is goodbye after almost 11 years.  I really lament the loss of Twitter as a friendly place to hang out with other like-minded programmers.  I've not found another spot like it and that makes me a bit melancholy.  People have scattered to their favorite corners and the single gathering spot like Twitter will not be seen again.

# Hello, Other Networks

Since the 2023 blog post, there have been a few other things that happened.  To recap...

In July 2023, I started posting to [Bluesky](https://bsky.app/profile/tweegeemee.bsky.social).  I'm a happy user of the [MarshalX/atproto](https://github.com/MarshalX/atproto) library.  Bluesky has grown to be my largest community with 445 users as of April 1.

In June 2024, I started posting to [Threads](https://www.threads.net/@tweegeemee).  I had pretty high expectations for growth, but that growth has not really happened.  I have less than 100 active users after almost two years.  I had that in just a few months on Twitter, I'm pretty sure.   Threads has also had the most obscure error messages and issues.  They *really* do not want you posting links in your posts, they also don't want more than one hashtag.  So much for my default post style...

In November 2024, I found out that the Mastodon `botsin.space` site was shutting down. I needed to move and I was invited by [hsɹɐʎA xɘlA](https://genart.social/@loosenut) (thank you!) to move to [genart.social](https://genart.social/@tweegeemee).  Mastodon is a nice community, but quite small, with about the same number of users as Threads.

Around that same time, I noticed that I was getting "too many posts" errors on Twitter. They began rate limiting the posts, so that really was the "beginning of the end" for the Twitter/X bot.

[Tumblr](https://tweegeemee.tumblr.com/) continues to be a very active community with 278 users, but I have to say I get the most spam over there.  If you have a legitimate question or comment and I missed it, I'm sorry.  It seems everyone wonders if I want to be involved in some Crypto/NFT scheme.  With dozens of "Commission Open?" requests per day, I don't have the time to respond.

# A Decade of Evolutionary Artwork

On July 21, 2025, I (quietly) celebrated 10 years of posts.  Given the changes, it sure has been an adventure in many unpredictable ways.

For a trip down memory lane, here are the first four images we posted to Twitter...

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; max-width: 50%;">
  <a href="https://tweegeemee.com/i/150721_213802_r" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/15/07/21/213802_r.png" alt="150721_213802_r" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/150721_214128_r" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/15/07/21/214128_r.png" alt="150721_214128_r" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/150721_214234_r" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/15/07/21/214234_r.png" alt="150721_214234_r" style="width: 100%; height: auto; display: block;"></a>
  <a href="https://tweegeemee.com/i/150722_045223_r" target="_blank" rel="noopener noreferrer"><img src="https://cdn.tweegeemee.com/archive/15/07/22/045223_r.png" alt="150722_045223_r" style="width: 100%; height: auto; display: block;"></a>
</div>

# The Future

That brings you up to speed with things.  I hope you will consider following one or more of the bots and participate in tweegeemee's evolutionary art generation.

I do wonder if I should keep this going.  Every time I get close to considering shutting down, something wonderful is created or an interesting interaction happens with a fan.  So, for now, we will just keep on keeping on.