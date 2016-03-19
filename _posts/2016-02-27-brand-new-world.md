---
layout: post
title:  "Brand new world"
date:   2016-02-27 18:01:00 -0500
categories:
---

All great things must come to an end. As such, I have finally took the time to move my blog to a new home. Yes, readers! This wonderful adventure will now continue on a new site, with a lot of great stuff behind it.

## A history lesson

For those of you who have been following me for a while, you know that I have spent many years using the free and really great [wordpress.com](https://wordpress.com) cloud weblog provider. I have to say, I have never had any technical issue with their service and have never noticed any kind of downtime. So to make this clear already, no, I am not leaving them out of frustration.

Unfortunately, there is two things that any decent developer's blog need which WordPress could not provide at the very low price of *free*. The first one is custom domain names. I registered the [etiennenaheu.com](http://etiennemaheu.com) domain back in 2012 and I have never had the chance to use it before today to host my blog.

While this was only a minor hassle, the second issue I had with WordPress runs much deeper. They have no support for code snippets. They do not have a code formatter extension available to their free hosting tier and they do not support the [gist.github.com](https://gist.github.com) embeds. This meant more work for me, trying to format code blocks in a somewhat readable way, and made things harder for you as in the end, you would not enjoy any form of code formating.

Then, there was the little things here and there that could have been better. Like, for instance, managing drafts, versioning, diffs, the overall theme and text editor experience. All of these little things that, us developers, all so happen to already have a great solution for...

## GitHub to the rescue

This new blog is hosted on the incredible [GitHub Pages](https://pages.github.com) web hosting service. This means that I get to enjoy total control without having to care about hosting something on Microsoft Azure or Amazon Web Services myself. Let's see how this works, just in case you might be interested to join in.

I started by creating a github organization for the blog. This leaves some leeway if I ever want to on-board more publishers in the project. I created a repository to host the blog based on the instructions on the github pages' site. I then proceeded to configure a [Jekyll](http://jekyllrb.com/) static site, did some configuration tweaks and published a quick about page. GitHub pages have a deep integration with Jekyll which enables me to only keep the core files in my repository and leave the actual build process to the github servers.

What is really nice about this setup is that, while Jekyll have a concept of drafts, I can leverage the much more powerful pull request system of git to manage everything that I want to publish. This is a big time saver and it also act as a very flexible publishing mechanism.

I then proceeded on converting all of the original posts into [markdown](https://daringfireball.net/projects/markdown/) using [Visual Studio Code](https://code.visualstudio.com/) on my mac. After a few hours of formatting and re-structuring, I ended up with a fairly exhaustive set of posts to republish. This is great because with markdown files as a base for the site, I am now free to use whatever text editor I want and do not have to care about the final formatting which means less work for me and more content for you. Obviously, these posts now have proper syntax highlighting for all code snippets.

All the mainline posts that do not include external assets have been converted already. I should still have all the extra assets I used in the other pages laying around somewhere so I just need to add them to the repository before I can convert the remaining posts. I also left behind the longer "Teaching Modern Developement" series for now as I simply do not have enough time to convert it right now.

The last step was to bind the new custom domain and enjoy the show.

## The road ahead

Before I can definitely consider this move as done, there is still a few things that needs to be addressed. For instance, the site is currently running with the default theme and I would like to spend some time to design a better, more personal look for the site. I also need to finish to transfer all of the previous posts.

Once all of this is done, I will officially close the old site. In the meantime, update your bookmarks and RSS feeds folks, because here is our new home.

Read ya later!