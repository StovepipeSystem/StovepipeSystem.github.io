---
layout: post
title:  "Writing multitargeted C# code"
date:   2013-06-19 21:08:00 -0500
categories:
---

I have recently came across a post about [Windows 8](https://en.wikipedia.org/wiki/Windows_8) and how hard it is to take a piece of code written for an other platform (being [WPF](http://en.wikipedia.org/wiki/Windows_Presentation_Foundation), Cocoa or anything else) and port it over to the [WinRT platform](https://en.wikipedia.org/wiki/Windows_Runtime). Most people claim that writing portable code is just as challenging as writing multithreaded code. We'll take a look at why it is, and how we can make it easier to handle.

## The nail

As a developer, our main task is to find the right level of abstraction to solve a given problem. Let's say we want to read all the lines of a file from disk and output them one by one. In an old C# console app, we would do something like this:

{% highlight csharp %}
var list = new List<string>();

using (var sr = new StreamReader(path))
{
    var line = sr.ReadLine();

    while (line != null)
    {
        list.Add(line);
        line = sr.ReadLine();
    }
}

foreach (var line in lines)
{
    Debug.WriteLine(line);
}
{% endhighlight %}

While this makes a lot of sense, you will have a hard time porting this to WinRT. First, there is the sand-boxing issue. WinRT does not handle files the same way a console application does. You have very limited access and very limited capabilities. Second, the objects you would use to read the files are completely different. This makes it really hard to write portable code between those two platforms.

## The hammer

The hammer is a well known metaphor in the development world that reminds you how important it is to use the right tool for the right job, not only in the real world, but in the virtual world too.

We love our hammers. The one most people would use in such a situation is called preprocessor directives. Lets see how it goes:

{% highlight csharp %}
const string path = @"folder\file.txt";

IEnumerable<string> lines;

#if NETFX_CORE
    var root = Windows.ApplicationModel.Package.Current.InstalledLocation;

    var file = await root.GetFileAsync(path);

    lines = (await Windows.Storage.FileIO.ReadLinesAsync(file))
        as IEnumerable<string>;
#else
    var list = new List<string>();

    using (var sr = new StreamReader(path))
    {
        var line = sr.ReadLine();

        while (line != null)
        {
            list.Add(line);
            line = sr.ReadLine();
        }
    }

    lines = list;
#endif

foreach (var line in lines)
{
    Debug.WriteLine(line);
}
{% endhighlight %}

Not exactly portable, is it. While we might now have a way to read a file that works for both platform, assuming that it is accessible in both cases, only few lines can actually be reused. On top of that, this method requires to be `async` in WinRT but doesn't in console mode. This makes it even more complicated to use it and shows why preprocessor directives are evil. They can cascade really fast through all the methods and objects that use code depending on them and completely break the nice and clean abstraction layer we are trying to put in place. This is a good example of the wrong choice of hammer for the job. Let's try something better.

This time, lets use what we do best: abstraction. The big issue here is that WinRT is based on `async/await` while the other one uses `IEnumerable`. Two very different and incompatible way to handle these cases. While it would be possible to wrap the console code in a method by converting the list of string to an enumerable call using `yield return` like so:

{% highlight csharp %}
private IEnumerable<string> ReadLines(string path)
{
    using (var sr = new StreamReader(path))
    {
        var line = sr.ReadLine();

        while (line != null)
        {
            yield return line;
            line = sr.ReadLine();
        }
    }
}
{% endhighlight %}

It isn't possible to wrap the `async/await` call in a similar way. The main issue is that async and yield return are incompatible so you cannot yield and use `await` in the same method. This is a bummer since this solution would have been enough abstraction for this case. For now, this is obvisouly the wrong way to abstract our problem away.

## Rx all the way

In the Rx world, there is a very thin line between `Enumerable` and `Observable`. An enumerable is just a collection where you can request the next element. An observable is just a collection where you have to wait for the next element. It is then very easy to turn any enumerable in an observable with little overhead. Where this gets interesting is that there is an even thinner line between `Task` and `Observable`. A task is essentially just a collection of one result (the returned value) where you have to wait for the first element to be handed to you.

Because of this, Reactive Extensions offers the perfect tool, the perfect hammer, to abstract this problem and deal with it properly and easily. By using Rx, it is possible to encapsulate the process of getting a bunch of lines from a file and reacting to each of them as they are read to display them on the Debug output. The idea is to create a cold observable that will return all lines of a file. We can then observe the result to output them.

By doing this we can prevent bubbling of the preprocessor directives by making sure they stay within the method returning the observable. Let's take a look at how this would work.

{% highlight csharp %}
private IObservable ReadLines(string path)
{
#if NETFX_CORE
    var root = Windows.ApplicationModel.Package.Current.InstalledLocation;

    return root
        .GetFileAsync(path)
        .ToObservable()
        .SelectMany(file => Windows.Storage.FileIO
            .ReadLinesAsync(file)
            .ToObservable()
            .OfType<IEnumerable>()
            .SelectMany(enumerable => enumerable
                .ToObservable()
            )
        );
#else
    return Observable.Create(observer => {
        using (var sr = new StreamReader(path))
        {
            var line = sr.ReadLine();

            while (line != null)
            {
                observer.OnNext(line);
                line = sr.ReadLine();
            }
        }
    });
#endif
}

void main()
{
    const string path = @"folder\file.txt";

    var lines = ReadLines(path);

    lines.Subscribe(line => Debug.WriteLine(line));
}
{% endhighlight %}

## But, #if is still evil...

That's right. I did said that preprocessor directives are evil. So, if we managed to abstract to incompatible concept in one nice and clean observable, there must be a way to do the same with those directives. You can do without them by having different projects for different platforms. Using this technique, you can keep the behavior for different platforms in their own classes and inject them using a common interface in your generic code. That way, you can keep different DI container initialization methods for each platform. You will end up with the following structure:

- Application.csproj
    - IReader.cs
    - Application.cs

- Application.WinRT.csproj
    - *IReader.cs
    - Reader.WinRT.cs
    - *Application.cs

- Application.WPF.csproj
    - *IReader.cs
    - Reader.WPF.cs
    - *Application.cs

{% highlight csharp %}
// IReader.cs
public interface IReader
{
    IObservable ReadLines(string path);
}

// Reader.WinRT.cs
public class Reader : IReader
{
    public IObservable ReadLines(string path) { ... }
}

// Reader.WPF.cs
public class Reader : IReader
{
    public IObservable ReadLines(string path) { ... }
}

// Application.cs
public class Application
{
    void main() { ... }
}
{% endhighlight %}

In such structure, all files marked with a * are linked files to the master "Application" project. This project is not built. Only the WinRT and WPF variants are. This means that each projects reference all the common files that they need through links and implements their specific behaviors locally. Using this structure, your shared code can reference specific abstractions through their interface which sets a common ground for all the platform specific implementations.

## Closing

That's it! All that you have to do to keep clean, portable and reusable code is to make sure to use the right abstraction for the job. While this might be more complex to put in place in an older project, it is still not impossible. You will also get a huge plus value in readability and manageability by doing such a refactoring in your old code base.