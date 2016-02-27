---
layout: post
title:  "If it ain't broken, don't fix it"
date:   2013-08-01 10:33:00 -0500
categories:
---

You probably heard this story before. There is a really big overhaul of some part of an app and then a massive amount of unhappy user starts to call out those big titles: "if it ain't broken, don't fix it" or "this is just change for the sake of change". This is a classic situation everyone of us developers will have to face one day.

## But... Why?

There are two main cases that will trigger such a reaction. One of them is caused by your users living in their bubble. The other is you living in yours.

### Expectations != Reality

Users expects that if something is good enough for them, then it works. If you need to go to work every morning, you probably have an alarm clock. If it gets a little fancy like mine (it's just my smartphone) you can probably tell it to wake you up on weekdays like I did. It works really well and I never had to deal with setting my alarm since then.

Lets imagine for a moment that the guy who wrote the software for my alarm forgot about leap years. Actually, that would be really surprising. Instead, lets imagine for a second that the guy who wrote my alarm forgot that in very specific conditions (DST is set and you have poor cellular reception) then the annual synchronization code crashes and leaves your clock 1 hour behind. This should remind you of a bug that plagued the iPhone during the last few years when it would simply loose track of time on January 1st. That means you are going to be up 1 hour late. More importantly, it means that something which work perfectly for you might not work for me because I live in a country that impose DST and you might not.

What might be good enough for one of your user might not be for an other. This is one of the classic situation that will induce change on features and it might not leave everyone happy. As a developer, you know how hard it can get to test every logical branch in your app. If it is hard for you who own the map of all branches, just imagine how hard it can be for a user to imagine different use cases than their own.

### The Unbreakables

What about things that cannot break? I'm sure you've heard of the polemic behind Microsoft Office's 2007 new Ribbon interface, or even Windows 8 new start screen. These are part of a different category of problem that I call the "unbreakables". These features usually work really well but you find that they don't age well. The menus in Office where originally designed to support only 7 items in them. Office 2003 had up to 58 items in a single menu. Not many people knows that or even notice that this hinder their workflow. Most users will think that everything is alright because they can do their work but in fact, this menu issue made it really painful to learn new features and even for experimented people to figure out were the features was.

A research conducted by Microsoft on menus concluded that for every additional item in a menu, you would have to scan the entire list one more time to find what you are looking for. You might not even do this consciously, but I am sure that you can remember at least one time when you looked at a list of items and the one you wanted was straight under your cursor. There you have it. You were so busy scanning the list that you couldn't see the one that was already highlighted for you.

The start menu has a similar story. It was nice for a while, but again, it was so inefficient at its main tasks that browsing through it would get really painful at times; specially if you had tons of programs installed. The list would span two or even three columns if you didn't took the time to manage it, and when you did, updating a single app could render your formidable organizing skills go to dust. Then, there was the XP solution. Microsoft had the wonderful idea to simply hide the full list and tried to figure out which items you really needed. The same happened in Office 2003 where most elements would be hidden by default. This just made things more painful.

If you have some time, take a look at [this hour and a half long presentation](http://www.youtube.com/watch?v=Tl9kD693ie4). It tells the story of the Microsoft Office user interface and explains really well why the old UI failed. This is the perfect example of an unbreakable. It doesn't matter if the replacement is better. People had the time to get used to it and think that it works perfectly because it stuck for years without any changes. Definitely expect retaliation if you play with those.

## If only I could do this faster...

I already shown that it is possible to have bugs (unexpected behaviors) and ubreakables (unexpected evolutions). There are a lot more places where things can go wrong. What if you fix a bug, but introduce a 4x performance drop? What if you automate steps that used to be repeated? What if you add a feature but it just looks out of place? These are all process improvements that you can do which will put you and your users in a love hate relationship.

Don't expect your users to think when they use your product. It may sound harsh but its true. You are the genius. It is you who have to think about those process improvements. Some times you will get an email with someone suggesting a better way. It might be a really cool feature too, but it might also not work for everyone without some tweaking first. This is often the best way to get bad press and is exactly what happened with Office 2007 and its new Ribbon or Windows 8 and its new start screen.

If you change even the simplest part of a process, you force your users to adapt to the change. For a long time, you offered them a solution for a problem that they had. You offered them a way that they did not had to think about and now, you change it, forcing them to think about what is happening.

Agile gave you one important knowledge. It told you that at one point, your processes will fail and that you will have to be creative and find new, better ways to do things. Unless your users are developers, they most likely never learned this. They never got used to it like you did. If you change something that they depend on, they will complain even if it makes their life easier because they do not want to think. They do not want to learn your product again.

## Should I fix it or not?

There is always room for improvements. There always will be something that can be done to make things better or faster. It doesn't matter if it is just incremental changes or a complete re-design, there will be a solution. The key is to never introduce breaking changes. This is easy when you think about an API or storing data, but fixing processes can be trickier.

If you look at Office 2007 there is only one reason why it got so much bad press. It is not because of the whole design overhaul, its because people had to deal with it right away. They changed so much features in Office 2007 that they even had to introduce a new file format to support them. On top of that, those new features looked really cool and nice to use so people wanted to use Office 2007. On the other side, they didn't want to relearn what they already knew just to use those new features. This is a process-breaking change.

A frequent release cycle will really help you fix processes because they let you do a quick update, only changing the UI to the new version and then, once every one got used to it change the file format and add new features to your app. The key is that a process change is a new feature in itself and deserve a single, incremental release. We are far from the time that a minor update would mean a bug fix and a major one, a UI change. If you change something big, it deserves a major update; just like Chrome which is at version 28.0.1500 at the time of this writing.

## But I loved that bug...

The next challenge you will hit is dealing with bugs that people love an depend on. A good example for this one happened in recent versions of iOS. A bug in the logging system caused "private" information to be published in system logs publicly. You might have heard of it since I am talking about WiFi signal strength and other info that was not available through the public iOS API but was still very useful. People loved this bug because they could write apps that scanned the WiFi networks around you and helped you find a good one. But now that this has been fixed, these apps stopped working.

It is important to never consider such a bug as a feature. If someone depends on it, break it. Break it violently and cruelly. Then, make it look like its their fault!

Ok, that might be a little extravagant, but it is true! If you never break deprecated behavior, people will continue to use them and it might cripple your app with old code and dependencies as it ages. The best way to do this is by first marking the code as deprecated because of an undefined behavior. Inform your users about it and find a fix as fast as you can. You don't have to push it right away, but you can estimate its time of arrival in the product and give a dead line to your user. They will love you for this by the way. They will love you even more if in your fix, you include a way to continue using the old behavior, but this time in a clear and defined way. If you fix a glitch in your API that would cause the content to be filled with URLs of cute kitten pictures, then offer a proper endpoint to do it. Well, maybe not that one, but I'm sure you get the point.

Depending on broken practices is bad. You learned to never exploit undefined compiler behaviors so make sure to do the same with your bugs.

## Broken it is then!

Things are always broken. If someone gives you the if-it-ain't-broken-don't-fix-it stare, show them why they are wrong. Explain to them why the new features are better than the old one. Give your user a reason to pay for your new product. Don't just accept bad press over decisions that you took for the greater good. Sometimes it won't help, but most of the time it will.

Again, read you later!