---
layout: post
title:  "Inheritance is evil"
date:   2015-05-18 18:53:00 -0500
categories:
footnotes:
 - Yes, a very popular one that I will not name will only look for properties in alphabetical order. Trying to deserialize A, C, B, D will simply cause B to be skipped.
---

This is something one of my previous mentors used to say all the time. I love the way he puts such a complex principle in those simple three words: *Inheritance. Is. Evil.* It is funny because this is one of the first things most schools will teach you when they talk about Object Oriented Programming. What is inheritance? What can you do with it? Why should you use it? These are all the topics that your course will cover, but "why is it evil" is definitely not one of them.

## Kinds of Inheritance
Most cases of inheritance in OOP can be separated into two groups. You have data (or structural) inheritance and you have behavior (functional) inheritance.

You use data inheritance when you create a set of entities, plain old C/Java/Whatever objects, that inherits from each others. You probably remember the classic library example where you have a base `Media` class and a `Book`, `Movie` and `Song` classes as its decedents. All of those items shares part of their data. They all have a unique id within your library, a title, an author and publication date. All of this data is inherited from the base `Media` class.

The other kind of inheritance is generally introduced at the same time as polymorphism. Behavior inheritance happens when you share common behavior through a base class. For instance, you could have a `Plugin` class that provides a set of basic behaviors for a plugin to your application like getting the version number of the application or injecting their own UI elements into your application. Other developers can inherit from this class to hook their own code and thus adding features to the host software. In this case, all plugins will share the same basic behavior and add their own to it through hooks provided, usually, via virtual methods.

## Eeeeeviiiil!

What's so bad then? This sounds pretty useful but there is a catch. Those are perfect, book-worthy example. In real life, things are rarely black and white. Your application's structure will change and you will miss things along the way, Because of this, things can get pretty funky when you strongly depend on inheritance. This is why some APIs that seems very well thought, even in modern systems like the WPF framework in C#, can some times be a pain to work with.

### When things are not what they seem to be

Let's take a quick look at data inheritance first. Lets say you are dealing with a simple drawing application. You might have a set of tools to draw basic shapes. You might want to support squares, rectangles, circles and lines. You can already see the hierarchy appear in your head. There is a `Shape` base class with all shapes inheriting from it.

![Basic Shapes]({{ site.url }}/assets/2015-05-18-inheritance-is-evil/1-basic-shapes.png)

Then, you remember from an old geometry class that squares are just rectangles with both sides sharing the same length. You go on ahead and change the structure so that the `Square` class inherit from the `Rectangle` class because, after all, a `Square` *IS A* `Rectangle`. You release your application and a large amount of people loves it.

Then, some users starts on complaining about files being large and the app being slow. In your investigation, you notice that the `Square` class waste a lot of space in memory because it stores the same data twice. Since you are reusing the `Rectangle` data structure, you have to fill both the `Width` and `Height` property all the time with the same value which effectively doubles the amount of memory required to store a `Square`.

![Square is a Rectangle]({{ site.url }}/assets/2015-05-18-inheritance-is-evil/2-square-is-a-rectangle.png)

You think about it a little and you decide to reverse this hierarchy. By having the `Rectangle` being a `Square`, you can have the `Square`class only define the `Width` property and the `Rectangle` class define the `Height`.

![Rectangle is a Square]({{ site.url }}/assets/2015-05-18-inheritance-is-evil/3-rectangle-is-a-square.png)

This is definitely a solution that could work, but you would end up with two new and more subtle problems on your hands. First, you will probably find it a little awkward to use the `Width` name in squares. This is specially true if you are dealing with perimeter calculations or when you will need to pass it as a *y* coordinate. If someone read your code, they will probably think you made a copy/paste mistake. You will probably want to use a different name like `Size` but that would cause a similar issue when dealing with `Rectangles`. You could work-around this issue by using `Size`and adding a `Width` property as an alias in the `Rectangle` class. The bigger problem, though, comes from broken semantics. Every one who learned that a square is a rectangle will undergo the same thought process as you originally did. Unless they had the same problem before, they will all expect the `Rectangle` class to inherit from the `Square` class.

Dead end.

This is why data inheritance is evil. It is really tempting to match virtual objects to real world object, but you shouldn't always choose that path. It is also very tempting to optimize your data structure by going on more than two levels, but this often introduce semantic issues and adds to the complexity of your code. The best solution in this case is to keep `Square` and `Rectangle` as separate classes. This ensures that `Rectangle` and its related code will never change because `Square` does, which is one of the SOLID principles you should admire and love. It also better matches the semantics of your application as you will probably always display both objects side by side, grouped as shapes.

It is important to note here that the point is not to avoid data inheritance at all cost. Data inheritance is a very useful tool that can, and will help you accomplish your tasks. Also keep in mind that this entire time we kept the `Shape` class in the mix without any problems. The risk in using it is that trying to map virtual objects to real world objects is very tempting and often the wrong path to take. Do not over-think your inheritance hierarchy. Keep your objects as simple and as close as possible to your problem's domain and everything will be fine.

Still, this isn't exactly evil...

### Leave it to evolution to crash the party

Now that this is out of the way, let's look at what can go wrong when you are using behavior inheritance. Again, we are dealing with a very powerful tool that is often misused and misunderstood. We do not need to look very far to find issues with it. Imagine that you have a set of classes that can be serialized. All objects will have a `Serialize` method that should give out a text-based representation of the object. For these classes, you might have decided to output a JSON string. Your objects are simple so you also decided to do it by hand.

{% highlight csharp %}
class Root
{
    private int _foo;
    private string _bar;

    public virtual string Serialize()
    {
        return "{ \"foo\" : " + _foo + ", \"bar\" : " + _bar + " }";
    }
}
{% endhighlight %}

That looks good. It could be made simpler but that is not the point. If you wanted to create a class that inherited from this one, what would you do? You will probably want to add your own properties to it. You will also have to override the `Serialize` method in that case. Because it returns a specifically formatted string, you cannot just append the new properties at the end. You have to deal with a closing bracket there. You can't really rebuild the entire string because some of the base class properties are private. Your only solution is to manually find where you need to inject your properties. This can be really tedious, specially if your deserializer impose an order on the property list<sup>1</sup>.

Even if you managed to make it work, how would you test it? You could easily write a mock class to test the base class behavior, but how would you test a specialized class without bloating your tests with the base class behavior all the time? It is simply impossible. For the same reason, it is impossible to make the derived class a true SOLID entity. Depending on how you will build your serialization code, you will either end up being terribly inefficient or you will assume a lot of things about the base class' value which will break your code if it ever changes.

Dead end... Again.

The biggest problem with behavior inheritance is that it nearly never works. Even if your architecture stays stable for a long time and everything seems alright, something is going to happen that will throw it off. A classic is the new async framework in .NET 4.5. How are you supposed to await a method from a virtual method that has no async counterpart?

{% highlight csharp %}
protected override void Callback(State state)
{
    // Pick your poison:
    somethingAsync().Wait();
    somethingAsync();
    await somethingAsync(); // Declare the method as async void
}
{% endhighlight %}

You could block until it returns, which really is a bad idea and might cause a deadlock, or you could fire and forget it, which is an even worst idea as you will miss all exceptions that could happen! In the end, you simply cannot turn that method into an async one because of your base class' limitations. You need to add a second overload that can handle a `Task` return type with a default implementation that calls the synchronous version. Then, if you are lucky, or if you properly documented this method, people will not call the base implementation when they override it. If they do, all hell might break loose...

If we go back to our plugin example from earlier, this means that the host application needs to provide both a synchronous and an asynchronous version of the Plugin class. Even then, if async is only needed for a single method, turning all methods into async ones will be inefficient.

Still, no sugar for you.

## Is there an alternative?

What should you do if you encounter one of those problems? The solution is simple. *Do not use inheritance.* Or at least, do not use *behavior* inheritance and keep data inheritance to a minimum. Try to use other techniques like composition, delegation or events instead. Make sure that your classes can talk to each other and work together instead of overriding each other's behaviors. Write cooperative code instead of dictatorial code. Use interfaces and dependency injection. Write your code as actors like if they were micro services.

These simple tricks will help you solve all the problems we had when using behavior inheritance. If you need an async version of a method, you can make an async version of it's interface and let people use the one they need. You could also use a different strategy and use an abstraction that supports both the synchronous and the asynchronous versions.

You could easily handle the last example using plain old c objects and services. No need for inheritance. Yes, you will end up with a couple more classes, but who cares. Your code will be testable, both ways, it will be extensible, it will be simple and each classes will have a single responsibility. Basically, it will be SOLID.

That's all I have for you today folks! Read ya later!
