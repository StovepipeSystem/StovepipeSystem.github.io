---
layout: post
title:  "Throwing exceptions"
date:   2013-08-04 15:22:00 -0500
categories:
---

Today, I've came across something I wrote about two months ago. That little piece of code made total sense to me back then, but today, I looked back at it and questioned what I did. I have this class that registers a bunch of other classes, a little like plugins, using the `Activator.CreateInstance` method from the .NET framwork. Obviously, those plugins can only be registered once so if I detected that said plugin was already registered, I just threw an exception. Here is the code in question:

{% highlight csharp %}
private void LoadModule(Type moduleType)
{
    if (!typeof(IModule).IsAssignableFrom(moduleType))
    {
        throw new InvalidOperationException(Constants.InvalidType);
    }

    var module = (IModule)Activator.CreateInstance(moduleType);

    if (Modules.ContainsKey(module.Identifier))
    {
        throw new InvalidOperationException(Constants.AlreadyRegistered);
    }

    module.Init();

    Modules.Add(module.Identifier, module.ServiceLocator);
}
{% endhighlight %}

## The task of exceptions

Exceptions are a very important concept to understand. Their goal is to interrupt the flow of a program that cannot pursue its task. For instance, if you pass `null` to a method such as `Activator.CreateInstance`, expect an exception to be thrown since you can't create an instance of type `null`. It makes no sense for this method to return `null` either since `null` is not an instance of some `Null`type. It's not even an instance. In such case, throwing an exception when `null` is passed as parameter makes perfect sense.

Using exceptions, we can easily stop the current logic and inspect what went wrong to hopefully fix the problem and then try again. Exceptions will usually bubble up to the user in some form or an other, like a 404 page for instance. In this case, the user would expect an error message to be displayed at startup telling him to check his configuration files. Lets be clear here, their goal is not to perform logic or to handle manageable states. Do not use exceptions to return values. Exceptions are for critical errors only.

## The line between error and fatal

But what is a critical error? And more importantly, what is the difference between a critical error and a fatal error? Fatal errors should never happen. They are the crashes and the BSODs that everyone knows and fear. They are the 404, 503 and file not found error that you see every day. They can cause data loss and might badly corrupt a computer or program when they happen. These are bad, bad cases where the software need to interrupt the flow because moving on could just break everything even more or waste CPU cycles. Those are a very good candidate for exceptions.

On the other side, error cases like a missing semi-colon in your code or even an out of range value are more ambiguous. You should manage those cases since they are not necessarily fatal. You can do something about them and try again with new data. You can always choose to use the max value or act like if that this semi-colon has always been there. You can't go on, but you can fix it and try again. Some times you will be able to do it by yourself with fallbacks, others, you can just ask your user for new data. Those are an other good candidate for exceptions but they might also be resolved in different ways.

## Going on is relative

There is a big problem with "going on" though: What does it really mean to go on? In my case, I was loading plugins so if one of them as already been loaded, I could just go on and load the next one. Instead, I decided to throw an exception. This behavior might sound unexpected considering what I just said but it is not necessarily a bad once. It all have to do with finding that line between errors and fatals. Since this has to do with program initialization and a missing plugin could cascade into a flurry of exception from other assemblies, I decided to consider this case fatal.

I decided to throw an exception to prevent further damage. Even though I could go on with loading more and more assemblies, they would probably fail anyway so it is just not worth loading anything. If all of the plugins would have been completely independent, I could have simply skipped it, log the error and go on with the next one. It is important to understand the process of your application, the ultimate goal of your code, to take the right decision and handle errors properly.

As always, I hope this helped you in some way. Read you later!

PS: If you want to know what happened in the end, I ended up checking in a comment on top of that throw to explain why I made this choice and not just log an error as I could have done.