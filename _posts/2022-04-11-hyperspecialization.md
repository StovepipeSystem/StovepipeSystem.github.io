---
layout: post
title:  "Hyper-specialization, or How to kill a business"
date:   2022-04-11 17:30:00 -0500
categories:
---

In my career, I have had the privilege of working for a large amount of businesses across many fields. They all suffered from the same problem, and I am starting to believe that this is also the root cause of a large amount of failures in the software industry.

Software engineers, software developers, programmers; It doesn't really matter what you choose to call yourself. These titles come with an expected set of capabilities and knowledge usually centered around writing code. Just as you go see a dermatologist for skin care and an oncologist for cancer care, you might see an architect to plan the structure of your app, or a designer to make it look good.

Architects and designers... Are those titles you've seen in your company? What about front-end and back-end developers? What about team lead or tech lead? What about react developer and devops? All of these titles are labels that we assign ourselves as we get more and more specialized in our role. They help us differentiate ourselves and enable people to quickly decide if we can provide value to them. Most companies out there will use these titles, and even depend on them to structure their internal processes. How often have you seen stuff like "a lead will review your code before the devops guys push it to production"? More often than you've seen your doctor recommend you to a specialist; I hope...

On the surface, this looks like a good idea. You wouldn't trust a dermatologist for heart surgery, so why would you trust a designer with your deployment pipeline?

## Today, I stumbled upon a conversation on twitter...

> **TheLiverDoc:**  
> I lost a patient today
>
> Sad: Healthy, teetotaler   
> Sadder: Died of acute liver failure   
> Saddest: Cause is KERAGLO, herbal drug for hair growth   
> Worst: He was only 25y
>
> KERAGLO has borage seed oil & greentea extract, leads to liver failure
>
> Doctors need an education  
> Not patients 🙏

> **AbbasKigga:**  
> Keraglo men All over India number one Brand from decades for hair care.up to now single Dermatologist also not complaint any side effects from this brands. [...]

> **TheLiverDoc:**  
> Dermatologists do not manage liver failure.

*(2022-04-10, https://twitter.com/theliverdr/status/1513543982134923265 )*

Did that last tweet hit you as hard as it hit me?

"Dermatologists do not manage liver failure"...

This might sound silly but... What do you do when the decision of a designer causes the app to leak sensitive user data in production because their design doesn't account for something critical like authentication? There are a whole spectrum of answers to that question. Today, I want you to consider what someone working in a LEAN company, focused on hyper-specialized roles, might experience.

In a hyper-specialized world, the client doesn't know anything about software development, much less about software security. They can't be expected to notice this kind of issue before the design turn into specifications. In fact, if what happened in the United States recently is anything to go by, they probably won't notice at all... until a white-hat tells them they are leaking SSN all over the place.  
*( https://arstechnica.com/tech-policy/2021/10/viewing-website-html-code-is-not-illegal-or-hacking-prof-tells-missouri-gov/ )*

It doesn't have to be that extreme either. What does your login flow looks like? Do you ask for an OTP before a password? Do you let people recover their password? What if they provide an email that's not in your database? Do you ensure that the page will provide the same message, at the same speed as if they were? This is the kind of security bug I have seen in banks, and they often happen because designers aren't security nuts, even in this kind of environment.

In a hyper-specialized world, the programmer probably doesn't know about the details of how the app will be used. To him, it might just be a prototype or an app used in a locked down network where all authentication is done via proxy. Most likely, he might not even be trained to think about security.  
*( https://www.securecodewarrior.com/press-releases/secure-code-warrior-survey-finds-86-of-developers-do-not-view-application-security-as-a-top-priority )*

Something very common you might have witnessed is your company hiring a consultant to help develop a proof of concept for a long term project, all while your team is churning away on a big feature that needs to be shipped on a deadline. After a few month, things gets more and more stressful for the consultant as they bust their deadline, and their budget. Eventually the company scraps the project and call it done. You've only heard rumors about that long term project when a new task shows up in your backlog: "deploy long term project in production". Your product owner tells you that the code is fine as they've seen it demoed multiple times. The module *only* needs to be integrated into the main app and shipped. The project is already way over budget, so they pressure you to score it "2 points". No one will ever audit that code for security issues. No one will ever question the requirement that user inputs should appear in error messages. No one will ever question if that input was sanitized beforehand, or not...

In a hyper-specialized world, the ops who wrote the build and deployment scripts also isn't trained in security. All they do is focus on getting the code to a remote machine. They don't know how to use git or how it works, so obviously they include the git folder; it was part of the deployment package after all. They don't know how to use nodejs or how it works, surely none of the packages the programmer used will dare to inject malicious code that sends sensitive data to some actor in a remote country. Not that they would think about it anyway. They are a dotnet shop, so node isn't exactly their speciality, they only use it to pull a few libraries on npm.  
*( https://www.zdnet.com/article/malicious-npm-packages-target-azure-developers-to-steal-personal-data/ )*

This might sound insane, but I've seen this kind of stuff happen in banks. One bank had a massive deployment process to ensure everything was safe to put in production. They had people look at your SQL scripts to make sure you wouldn't break the database. They had firewalls that prevented you from leaking data from servers on the internet. No one noticed when a popular analytics product made its way into an internal application with access to sensitive data and started pushing custom events with from *the user agent's computer* on the internet. Thankfully, it wasn't malicious and no sensitive data was collected.

In a hyper-specialized world, that data leak might kill the company... but no one is responsible to handle public disclosure... In fact, no one is even able to notice it (or the fact that two separate leaks happened that day), because in a hyper-specialized world, no business care about anything that isn't a revenue source. They will only care as much as legally required to protect their company. Assuming that someone notices and the leak is massive, the company can either start to care and hire a security specialist to audit everything they do which usually won't fix the problem, or they can declare bankruptcy; and start anew without consequences, obviously. There are no other options. If the leak isn't large enough, bad publicity is still publicity.  
*( https://www.infosecurity-magazine.com/news/okta-investigates-possible-lapsus/ )*

In a hyper-specialized world, no one manages liver failures...

## There's no way this is real!

And yet, we've all seen it happen multiple times. Most of the time, it isn't as dramatic as a data leak. Sometimes, it's a major bug that causes downtime, or frustrates your users for a while. Most of the time, though it's a lot more subtle than that. It translates into features that feels like they make no sense, or that could have been implemented better, performance issues left and right, or slow time to market.

In a hyper-specialized world, no dev are expected to design, implement and review meaningful analytics to grow the business. No dev have the time to read about and implement ideas like atomic design. No dev have to time to learn about a new UI framework that might accelerate development and transition the project away from the legacy one. No dev have the time to run after business people to understand the reasons behind that new feature that showed up in the backlog the same morning. All of this stuff is delegated to architect, designers, seo specialist, product owners, etc.

## LEAN is garbage

Whether you like it or not, businesses love hyper-specialization. It is the core concept behind The LEAN Enterprise, which focus on shedding redundancy in its processes; and eventually its people. The worst thing about LEAN is that there is a large industry right now focused on making you think it is called Agile (tm) when it is everything but. This is why tons of people hate Agile (tm) companies. At the core of being agile is understanding how you fit in your team and how you can react when things change. You cannot do that properly if you don't communicate effectively with others. You cannot do that properly without understanding their reality. You can't be agile if you can't do every job in the shop; even badly. This is why LEAN and agile are fundamentally incompatible. I won't go into the details of why this is the case. Instead, take a look at [The Agile Labor Union](http://www.metareader.org/post/agile-labor-union.html), a great article from 2014 that probably flew under your radar.

Don't be hyper-specialized. It leads to bad products. You're discouraged to learn from your peers as it takes time from the company's pocket. Besides, why would you, they're not in your role anyway. Being hyper-specialized slows down development and turn everything fun into tedious paperwork. Instead, be Agile, be curious. If you can't do everything from gathering requirements to managing productions servers, you don't fit my definition of Software Engineer. You don't have to be good at it, you need to be *able* to do it both as core competencies and in your day-to-day tasks. If your manager gets in the way of this, you are not a Software Engineer. You are a programmer. You type stuff into a machine, and it does things. You might be a very good programmer, but you can't *engineer* without the ability to impact the big picture. Do you know what other ubiquitous job title used to exist to turn precise specifications into results? [Computers](https://en.wikipedia.org/wiki/Computer_(occupation)).

Without that knowledge, without that capability, you can't write good software, you can't manage liver failures, and then your business dies. Eventually, as automation and LEAN-adjacent practices rages on, your job as a programmer and life-long love of software development will die too.

Read ya latter.