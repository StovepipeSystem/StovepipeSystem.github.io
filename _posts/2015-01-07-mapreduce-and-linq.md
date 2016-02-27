---
layout: post
title:  "MapReduce and LINQ"
date:   2015-01-07 12:09:00 -0500
categories:
---

A surprisingly useful yet extremely misunderstood tool when dealing with large amount of data is the map/reduce pattern. There is a large amount of frameworks out there like MapReduce and Hadoop which makes it look like this is insanely complicated, and it is. Those implementations are very complex because they also deal with the problem of distributed data. At heart though, the pattern itself behind those implementation is very simple. Lets explore it and see how we could build a crude implementation of a MapReduce framework for C#.

## Understanding MapReduce

The idea behind MapReduce is that most operations behind large amount of data can be done in two steps: one step that needs to be as close as possible to the data and one step that needs as much data as possible. For instance, you might want to count all instance of the word "banana" in a massive database. If this database is distributed across the globe, it would be very expensive if not prohibitive to transfer all the data to a machine for processing. Instead, we will first count the instance of this word locally, near the data, for each machine in the cluster. This will produce a bunch of very small values, the local count, that can be easily regrouped together on a single computer and then processed.

The Map operation is the one working close to the data. The Reduce operation is the one dealing with the large amount of results.

{% highlight csharp %}
int Map(IEnumerable<string> allLocalData) {
    return allLocalData.Count(s => s.Equals("banana"));
}

int Reduce(IEnumerable<int> allMappedData) {
    return allMappedData.Sum();
}
{% endhighlight%}

This example is too simple to understand the use of MapReduce in a non distributed system. A more appropriate example would be compressing a large amount of images. There is one operation that needs to be done close to the data, the compression, and one that needs as much information as possible, the progress report. In this example, we can clearly see that MapReduce is about nothing more than executing a task on a large amount of data and collecting results. It does not matter if the compression is run sequentially or in parallel on multiple thread.

To make this clear, the pattern is only about data locality and not about asynchronous or parallel programming. Though, the goal of this pattern is to simplify large processing problems to enable some degree of parallel programming on them.

This pattern is generic enough to be used in a lot of cases. You might already be familiar with the `Task.WhenAll()` or `IEnumerable.Select()` methods and you might already have used them before. These are at the core of a basic, asynchronous and parallel implementation of the map reduce pattern in C#.

{% highlight csharp %}
var inputs = new [] { "0.png", "1.png", "2.png" };

var map = inputs.Select(input => Task.Factory.StartNew(() =>
    CompressToJpegAndReturnMetadata(input))
);

var results = await Task.WhenAll(map);

double reduce = results.Select(r => r.CompressionRatio).Average();
{% endhighlight%}

We start from of list of items to process. Here we are dealing with a list of files, but this could be anything: a large database, pixels in a bitmap, words in a documents, etc.  Then, we project each of those items to a Task which will execute some process over those items. In this case, we compress each file to the jpeg format and returns metadata once the process is finished. This is a CPU intensive process and compressing many files simultaneously is a great way to save time. Finally, we execute all of those tasks and wait for all resulting metadata to arrive. Once we have everything, we calculate the average compression ratio of all the files that we processed. This is an easy tasks as the expensive work has already been done.

From this prototype, we can extract the specifics of our problem to keep only the MapReduce code hidden behind.

{% highlight csharp %}
public Task<TResult> MapReduce<TInput, TIntermediate, TResult>(
    IEnumerable<TInput> inputs,
    Func<TInput, TIntermediate> mapDelegate,
    Func<IEnumerable<TIntermediate>, TResult> reduceDelegate
)
{
    var results = new ConcurrentBag<TResult>();
    inputs
        .AsParallel()
        .Select(mapDelegate)
        .ForAll(r => results.Add(r));
    return reduceDelegate(results);
}
{% endhighlight%}

This snippet of code contains all that is specific to the map reduce process that we used in the previous example. If you played with PLINQ, this should look very simple to you. We create an object to store the temporary data between the map and reduce operation. Then, we run a map delegate over all inputs, in parallel and put the result in the bag as they arrive from the map operation. Once the map operation is done, we start reducing the values using the reduce delegate and then return the result. This extension method enables the user to focus on the business logic and keep the map reduce implementation hidden.

{% highlight csharp %}
var average = somePngFiles.MapReduce(
    CompressToJpegAndReturnMetadata,
    rs => rs.Select(r => r.CompressionRatio).Average()
);
{% endhighlight%}

While this implementation supports parallelism, it lack support for asynchronous programming. You would first need to improve it to support Tasks like in the original case and to call the reduce delegate, not once all the data has been processed, but as soon as the data arrives. The solution here is to use Rx instead of PLINQ to solve the problem. I will leave the exercise to the reader to figure out how this would work.

Keep in mind that this is only implementing the MapReduce pattern and not a full, distributed map reduce framework. Still, you could easily use the map and reduce delegate to call in a remote API to provide the data and do some processing.

## Conclusion

By trying to implement the MapReduce pattern in C#, it quickly becomes evident that it is already deeply part of the .NET language. We can already get pretty close with just a Select and Aggregate operation and it does not take much more work to support parallel and asynchronous programming.

That's it! Hopefully this will help you understand what is going on deep inside those more complex MapReduce frameworks available out there.

Have fun and read you later!