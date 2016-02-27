---
layout: post
title:  "Prevent and organize complexity"
date:   2013-09-28 18:56:00 -0500
categories:
---

Sorry for all of my dedicated readers out there. I was trying to get this blog up to a more regular schedule and I had a big rush at the company I currently work for during the last few weeks and it left me absolutely no time to write. I hope this wall of text will be worth the wait. This post is somewhat of a follow up to one I wrote last month about dealing with bugs in your apps as we will be looking on the topic of complexity and how to manage it to ultimately reduce the amount of bugs we cause.

## What is complexity

The definition of complexity varies from one to an other and I will use my own definition of complexity for the remaining of this post. For me, complexity is the journey between defining a task and achieving it. As you would expect, simplicity is trying to keep this journey as short as possible. Perfect simplicity is achieved when it takes zero steps to accomplish a task. You probably already see the paradox here. Since it is a journey in itself to reduce complexity, it makes it impossible to reach perfect simplicity since reducing is not a zero-stepped action.

Knowing that perfect simplicity is impossible to achieve, you should then aim at managing complexity. The goal of this task is to remove as much complexity as possible without introducing new complexity yourself. For instance, no one will use a phone to order a pizza if it is more complicated than just walk in front of the guy and asking him a cheese-pepperoni. Managing complexity means understanding what it means for a system to be complex as well as well as how to reduce the level of complexity and when to reduce it. Obviously, this is not an easy task but hopefully I will be able to guide you through some of it.

### Cyclomatic complexity

Complexity comes in many forms, but cyclomatic complexity is probably the term you will hear the most. Basically, the CCI (cyclomatic complexity index) is the amount of all possible paths from start to finish in a set of instructions. For instance the following code, taken from the wikipedia article on [cyclomatic complexity](http://en.wikipedia.org/wiki/Cyclomatic_complexity), will produce an index of 3:

{% highlight c %}
if( c1() )
    f1();
else
    f2();

if( c2() )
    f3();
else
    f4();
{% endhighlight %}
   
As complexity goes up, the number of paths in the code multiplies. You can see why having a high CCI is really bad to keep code readable. In a block with a CCI of 10 or 15, the code is so complex that it could take an hour just to figure out what is going on in there.

### UI complexity

UI complexity is the amount of movements a user need to do and the amount of controls they need to interact with to accomplish an operation. I have given a few examples of UI complexity in my other blog, [HiTekReview](http://hitekreview.wordpress.com/2013/06/28/windows-8-1-the-old-new-stufd/) in an article about Windows 8.1. Obviously, the less movements you need to do, the better. Why make a coffee in 12 steps (prosumer espresso machine) when you can just do it in 3 (capsule espresso machine)? Taste you might say, and you would be right, but not every one loves coffee as much as you do so maybe your UI might not be to the taste of some of your users. Obviously, problem arises when it is not to the taste of most of your users.

### Flow complexity

This type of complexity is very similar to the previous one in which it has to do with the way elements are layout on the screen. It is different though in a sense that while the previous one was about physical distance between elements and the amount of elements on the screen at one time, flow complexity is about having to remember elements between each views of your application. If you ever walked in a room and completely forgot what you were about to do, you know exactly the dangers of this type of complexity. You start to fill in a bunch of fields in a form, click next and then they ask for something you had open underneath or even an information from the previous page. It also have to do with the amount of steps you need to take to accomplish a task but not in the amount of clicks. Instead flow complexity arise when the amount of views and states becomes to high between the start and the finish line.

### Configuration complexity

It's nice to play with or build a very powerful tool, but when it gets too powerful, configuring it might be more trouble than its worth. Take the Valve Source engine for instance. It has pretty much unlimited configurability. I mean, you can probably get it to make you a coffee in the morning if you try hard enough. That's fine because the people who will be configuring it are game design specialists. On the other side, lets look at a tiny app I use all the time which is called *Equalizer APO*. This app hooks itself in the Windows Audio stack and act as a powerful equalizer so that you can calibrate your speakers or just have fun. Instead of adding a nice UI in the Audio Effects settings of Windows like all other APO does, it monitors a text file in the Program File directory were you can add lines of code to configure your eqs the way you want. They just lost 90% of their market because of this, if not more. It took me 4 hours to configure my speakers correctly and I only had eqs to configure. It would have taken me 10 minutes if I had a UI to properly visualize what I was doing. They claim that their config file is compatible with an other speaker calibration software, which is free, but it is also hidden as a registered-only forum download by a freak redneck (no really, thats the way he calls himself on the forums) who doesn't even allow gmail addresses to be registered because he gets to much spam from them. Yikes... Config hell!

## Why should you care

As a developer, your main task is not to write code or design UIs or publish documentation. Those are all artifacts of our every day ceremonies but have nothing to do with our real final product, which, by the way, is not software. The job of a developer is to take the very complicated problem of someone else, make it your own and figure out a way to make it simpler. That's it, and we call this managing complexity. You are a specialist at making things as simple as possible for everyone around you. If you write an app that can make you a coffee, don't have it ask you the exact amount of water, pressure, milk, sugar and grind it need to do its task every time. Just have a large, big, shiny button with a label that says "Press button, receive coffee" under it and you will be in business.

This is what Apple keeps on telling us over and over again. People don't want the ability to configure an IMAP server with domain names and ports into their mail app. They want to type their iCloud username and be done with it. This is why Microsoft have the autodiscover protocol for Exchange and Single SignOn setup everywhere by your faithful IT guy. This is why you are a developer. Your task is to make these simple, one-click-config, one-click-buy, one-click-anything happen.

So, if you are so good at doing it for others, why don't you do it for yourself? All of those different complexity sources can slow down development to a crawl. If you let your code get too complex, or your build settings get too complex, you will have a hard time reading it and tweaking it when needed. It also makes it harder to scale when more people gets added to the project as they have to learn all of those labyrinths of code and tweaks before they can get productive.

## Why should your clients care

It is also important that your clients understands the importance of complexity management in your job. If they don't take it into account, it might directly affect their ROI as they might end up with lots of bugs or poor maintainability. Even worse, they might become dependent of a poorly designed application which costs them millions a year to run, and switching over to a new one might cost even more because of the cost of converting all the data to a new format. They might also end up with skipped deadlines which might throw their business in the hole.

It is important to hit the sweet spot between complex and versatile. Think about it when you talk with your clients. Are they asking for features that they will only use once a year? Could you figure out a way to make it work without it? How much time would it save not to write this feature? If it takes $5 000 to write a feature to do the task that a single employee, paid $20 an hour three times a year, can do in 3 hours, you need to wait over 300 years before that feature paid itself. It might be a better suggestion to just skip it and let the guy do his own job. Not everything needs to be automated. On the other side, if it takes you 6 hours at $20 an hour to write a tiny app for your friend to do something that would have taken him 3 weeks, then that is worth automating; even if he uses the app just once in his life.

The key point here is that complexity is exponential. Adding a single relatively trivial feature can multiply your complexity by 3 times and adding a non trivial one can cause a 10 to 100 times boost in complexity. In a similar way, a single feature might cover 90% of your users needs but two features might only cover 95%. Is that second feature really worth a 10 fold augmentation in complexity? Maybe. It all depends on how you manage it.

## It's a ping pong game

This is also an other very important concept to keep in mind while developing software. Adding a feature causes more code complexity. This complexity will make it harder to add more features and even to see what features could be added ultimately causing entire rewrites. So how do you keep the ball from bouncing? Well you can't, but you can reduce the number of balls on the table. Here's a little check list for you:

1. Make sure every entity in your code, no matter how small, only does or is used for one thing: No variable reuse, simple and well named methods with small amount of parameters, short and to-the-point classes, logically grouped namespaces and finally complete and independent layers.
2. Use the right pattern for the right job. If you need to enumerate something, use `IEnumerable`. If you need to observe changes, use `IObservable`. If you need to keep a single instance of a type during the lifetime of your app, use a singleton (but don't forget that it is hard to test).
3. Test the code you use. If you can't test it simply, you can't use it properly.
4. Stay open for customization. It's not because a class looks final that it will stay this way.
5. Reuse as much as you can, but not too much either. It's not because a Line has the same properties than a Rectangle that they have to inherit each other.
6. If you have to introduce a dependency or a setting for an object to work, make sure its worth it.
7. Make sure that all of your dependencies are external. This will save you a lot of hassle when you will need to change them.
8. Finally, pass the right parameters. There is no need to pass in a whole array just to know if there is 0, 1 or many items in it to generate a pluralized string deep in a call tree, specially if you don't even use the items in the array.

These simple rules will help you a lot in managing your code complexity and keeping your code clean. I will keep the other types of complexities for an other time.

Read you later.