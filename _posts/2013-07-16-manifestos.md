---
layout: post
title:  "Manifestos"
date:   2013-07-16 22:19:00 -0500
categories:
---

## Agile Is Not Enough

I have known about the Agile Manifesto for a long time. For the few of you who might never have heard of it, it is simply a set of statements that illustrates what being agile means. This manifesto have been in the wild for a while now. You can see it at [agilemanifesto.org](http://agilemanifesto.org/) if you never saw it before. But what does it describes in reality? Even though it was written by developers, if you look at it carefully, you will notice that it is all about processes; dealing with management tasks. Actually, is it so management oriented that it can be applied to a lot more workloads than just software development. Simply replace "Working software" by "Useful output" and you're done; it now fits most business domains.

But what about writing software? Not developing it, writing it. Is there a set of principles upon which software developers can believe in and rely on to properly do the main task of their job? "Working software" is a pretty broad statement. What about something more specific? Well now, there is.

## Introducing The Reactive Manifesto

I remember reading a blog post a few years ago about how to write enterprise-class software. Not the AbstractFactoryBuilderFactoryFactory-class ones, the real Google-sized or 911-sized projects. That post talked about being scalable and resilient. It was a very interesting and in-dept post which, if I ever find it back, could definitely be introduced on this blog. Now though, we have even better. Yesterday a group of people published The Reactive Manifesto. It describes the key points that makes your applications go from "software" to "working software". There is four of them: Interactive, Scalable, Resilient and Event-Driven. Those four reactive traits are the building blocks for a good application.

I highly recommend that you take a look at the document yourself since it already does a really good job at explaining the Reactive principles. You can find it at [reactivemanifesto.org](http://reactivemanifesto.org/).

## Reactive Manifesto... In Code!

Lets take a look at each of the four traits and look at how we can make them transpire in code. First, I would like to point something very important for the rest of this post. While this manifesto have absolutely nothing to do with Reactive Extensions, it just so happens that they have a similar goal: being reactive. For me, this makes Rx the best tool to work this out so I will be heavily depending on it for the following samples. Now lets get started!

### Event-Driven

The very heart of Rx is all about abstracting and handling events. Simply put, an `IObservable` is an event source. Pretty much like a standard .NET event, you can subscribe to it and react to its triggers. The problem with .NET events is that they are very hard to pass around. You can't really trigger an event from your Data Access Layer and have your UI react to it without having forwarders at every level, or a very ugly separation of concerns. Observables, on the other hand, are really easy to move around. They are just objects, so you can move them around like any others. It makes it easy for you to build your DAL so that it returns an `IObservable<T>`, move it around and subscribe to it in your views.

{% highlight csharp %}
public class DAL
{
    public IObservable<Product[]> GetProducts()
    {
        var client = new HttpClient();
        var request = new HttpRequestMessage();

        // configure client and request

        client
            .SendAsync(request)
            .ToObservable()
            .DeserializeHttpResponseMessageTo<Product[]>();
    }
}

public class Business
{
    public IObservable<Product[]> DoStuffWithProducts()
    {
        var products = new DAL().GetProducts();

        // do stuff

        return products;
    }
}

public class View
{
    public void DisplayProductNames()
    {
        var products = new Business().DoStuffWithProducts();

        var names = products.Select(ps => ps.SelectMany(p => p.Name));

        names.Subscribe(DisplayName)
    }

    private void DisplayName(string name)
    {
        Console.WriteLine(name);
    }
}
{% endhighlight %}

Doing this will make you event-driven from bottom to top as well as top to bottom. While I have not mentioned it in my sample, it is also possible to react from UI events in the same way by converting them to observables and moving them around in your business layer. This method respects the Event-Driven trait in which it is an asynchronous stream of events that are entirely non blocking (through the use of proper schedulers).

### Scalable

Scalability is an inherent trait of Rx operators. They are designed to be stateless. In fact it is possible to completely avoid state in your code through the use of Rx. While the boilerplate might not be entirely stateless, you will very rarely need to introduce a state in your business logic. This happens because an observable chain in Rx acts as a single pipe of information. Using the right schedulers, you could even push events onto the network and hand them over to an other machine doing an other type of work like you can simply schedule them on a thread pool, or a specific thread.

Using this pipe architecture, it is really easy to scale in and out. For instance, lets take the following example of very popular resource intensive application:

{% highlight csharp %}
IObservable<data> datasource = FromObservable();

datasource.Map().Reduce().Subscribe(Output);
{% endhighlight %}

The classical MapReduce operation illustrated in the previous sample can be easily run on multiple threads, like so:

{% highlight csharp %}
IObservable<data> datasource = FromObservable();

datasource
    .SubscribeOn(new ThreadScheduler())
    .Map()
    .SubscribeOn(new ThreadScheduler())
    .Reduce()
    .SubscribeOn(Dispatcher.Instance)
    .Subscribe(Output);
{% endhighlight %}

In this example, I create a new thread to perform the Map operation, then, I create an other one to Reduce the set and finally output the result on the UI dispatcher. Since everything is also stateless, it is really easy to create a pipe that requires some data as an input, transform it and output it and run this pipe multiple times, on multiple machines with different information.

### Resilient

Rx also includes built-in state management mechanism. It does so by providing three data channels per observable: *Next*, *Error* and *Completed*. The *Next* channel is triggered every time a new value is pushed through the observable chain; this is the main channel. You can also support the *Error* channel which will get triggered every time an exception is pushed on the chain using `Observable.Throw()` or `Notification.CreateError()`. This channel bypass most of the operators so you can only care about the method you are working on at the time and ignore any future or previous errors. Finally, the *Completed* channel is triggered when the data source for the observable expires. For instance, if you observe a list of 10 items, once the 10th item is pushed in the *Next* channel, the *Completed* channel will be triggered. This provides you with a chance to do some last minute cleanup or, if nothing happened on the *Next* channel before, to handle an empty state.

This multi-channel architecture makes your application resilient in two ways. First, it lets you recover from error whenever you need it and keep the tedious error management away code that would otherwise be polluted by it. Seconds, it makes it really easy to restore the state of your application when an error occurs. You simply have to resubscribe to the observable and you are back in business. The only case where this wouldn't be enough is where your application holds a state outside of the observable chain. For instance, if you display a stream of tweets and an error happen, you might want to inform the user with a popup or a banner. When the connection is restored, you will want to close the popup before displaying new tweets, for sake of consistency.

{% highlight csharp %}
public void Test()
{
    var subject = new Subject();

    subject.OnNext(1);

    Subscribe(subject);

    subject.OnNext(2);
    subject.OnError(new Exception());
    subject.OnNext(3);

    Subscribe(subject);

    subject.OnNext(4);
    subject.OnCompleted();
    subject.OnNext(5);
    subject.OnError(new Exception());
}

public void Subscribe(IObservable source)
{
    subject.Subscribe(
        i => Console.WriteLine("New value: " + i),
        e => Console.WriteLine("Error: " + e),
        () => Console.WriteLine("Done!")
    );
}

// Output:
// New Value: 2
// Error: exception
// New Value: 4
// Done!
{% endhighlight %}

### Interactive

For the last part, I will start by quoting the manifesto: "Reactive applications use observable models, event streams and stateful clients." Using observable models... check. Using event streams... check. Having a... stateful client? Well yes. The UI should always be the largest part of your state. It will hold all of the data your application need. If you need to make sure that nothing is lost in case of a failure, you should implement observable chains from your UI to your back-end which will save the data for you as frequently as possible. You should also keep as much logic on the client as possible because it is a lot less expensive for client/server applications to scale out using the users' computers than to scale out using a gigantic server farm. Rx, again, will greatly help you with this by providing a large amount of operators and expansion to be done around an observable chain. You can project, aggregate, limit, and do many other things on observables. Here is a little abstract example to illustrate the possibilities.

{% highlight csharp %}
Observable
    .FromEventPattern(h => h += this.Click, h => h -= this.Click)
    .Where(args => args.LeftClick)
    .Select(args => args.Position)
    .SelectMany(pos => new GeoLocationService()
        .GetLocationFromPos(pos)
        .Take(1)
        .Select(loc => loc.Name)
        .Materialize()
        .Select(notif =>
        {
            if (notif.IsError || notif.IsCompleted)
            {
                return "Unknown";
            }

            return notif.Value;
        })
    )
    .Subscribe(n => DisplayPopup("You clicked on the city of " + n));
{% endhighlight %}

## Conclusion

Using Reactive Extension, it is really easy and straightforward to build an application that respects The Reactive Manifesto. As this type of programming becomes more and more mainstream, I expect applications to be more and more reactive, thus more stable and more powerful. Of course, never stop to have fun coding!

Read you next time.