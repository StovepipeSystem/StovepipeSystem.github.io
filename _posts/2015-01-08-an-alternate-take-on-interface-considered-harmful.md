---
layout: post
title:  "An alternate take on: 'Interface' Considered Harmful"
date:   2015-01-08 18:53:00 -0500
categories:
---

I usually agree with Uncle Bob's opinions quite easily. I even built this whole blog inspired by [his own](http://blog.cleancoder.com/) and his book: [CleanCode](http://www.amazon.ca/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882). --You should definitely read them, there are real mind openers. Today, though, he [posted an article that looked unusual](http://blog.cleancoder.com/uncle-bob/2015/01/08/InterfaceConsideredHarmful.html); even strange from a clean code advocate point of view. Today's article was about interfaces and why the `interface` keyword should be considered harmful.

I really liked reading it. It is an interesting way to view this language feature, but I think it is also a little twisted. The article, written as a discussion between two coders, starts with a simple question, "What do you think of interfaces?", and proceed to explore what they are, what is inheritance and multiple inheritance and then finally demonstrates why the explicit interface language feature is actually a bad thing.

I agree with him. If interfaces where created to "solve" the diamond inheritance ambiguity problem, because it just cannot happen anymore, then yes, it is obviously a bad solution. Multiple inheritance is a wonderful tool when used correctly and excluding it from a language just because there can be ambiguities is definitely not a reasonable solution.  That would be like saying that we should not use cars because fatal accidents can happen when driving them. It would set us back years in the past to not have cars and I believe that the lack of multiple inheritance in many languages can give that same feeling of living in the past.

## Something's not right here...

On a different note, I also think that he has overlooked something very important in this discussion: semantics. In his examples, he mentions that abstract classes like the one below can also act as an interface. In fact, this is how they are done in C++.

{% highlight cpp %}
public abstract class MyInterface {
    public abstract void f();
}
{% endhighlight %}

Here is where I think his reasoning went wrong. Abstract classes are interfaces, but interfaces are not abstract classes. That is, in the same sense as a square is a rectangle, but a rectangle is not necessarily a square. So what is the difference between abstract classes and interfaces then?

The base class(es) describes **what it is**.  
The interface(es) describes **what it can do**.

A good way to wrap your head around those differences is when thinking about someone in a recruiting process. This candidate is, well, a person, but it can also be hired or rejected.

{% highlight csharp %}
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string Address { get; set; }
}

public interface Hireable   { bool IsHired { get; }    void Hire();   }
public interface Rejectable { bool IsRejected { get; } void Reject(); }
public class Candidate : Person, Hireable, Rejectable {}
{% endhighlight %}

A candidate is definitely not a `Rejectable`. `Rejectable` is a behavior that we want to attach to a `Candidate`. It does not define what a `Candidate` is. `Person` on the other hand defines very well what a `Candidate` is. `Person`s have a name, an age, they live somewhere and can be contacted via various methods. Except for the last one, these all represent data points of a `Person`. Their ability to be contacted is not a data point. Their phone number is. This is an other behavior.

{% highlight csharp %}
public interface Contactable { string PhoneNumber { get; } void Contact(); }
public class Person : Contactable {}
{% endhighlight %}

Now we have a problem. What if we do not want our system to be able to contact a `Person` if it is not a candidate because we do not know what we would tell them. We still want `Person` to hold the contact information because a `Candidate` is about job offers and not personal information like a phone number. We could split the property from the interface, but then how would the Contact method knows where to call. It would have to be passed as a parameter every time by the caller of `Person` and that sure is ugly because now `Person` is not encapsulating the contact information anymore.

The solution to this problem is actually quite simple. In our system, a `Person` is not a completely functional entity. It cannot do its work all by itself. It needs to be at least a `Candidate` (or maybe a `Recruiter`) to function properly. Yet, `Person` cannot be turned into an interface because it is about data and not behavior. The solution is to make `Person` an abstract class.

{% highlight csharp %}
public interface Contactable { string PhoneNumber { get; } void Contact(); }
public abstract class Person : Contactable {
    public PhoneNumber { get; set; }
    public abstract void Contact();
}
{% endhighlight %}

Let's go back to the semantics of what we just built. A `Candidate` is a `Person` that can be contacted, hired and rejected. A `Person` is the information about a real world person that can be contacted but not without some context. There is a clear semantic difference between the two uses of inheritance in this situation. You are something and you can do things. Basically, in OOP, you are not defined by your actions, you are defined by your data.* Actions are just behaviors that we attach to this data.

## Is the interface keyword really evil?

Since interfaces and abstract classes are not equivalent in the semantic world, we cannot simply replace all interfaces by abstract classes, even if they could accomplish the same task when used in a language that have multiple inheritance capabilities. They mean different things and are not interchangeable.

The `interface` keyword is not really harmful. It is just that the language designers chose to prioritize proper semantics over language features. You could still have multiple inheritance and explicit interfaces in the same language. It is not because one is there and the other isn't that the `interface` or `abstract` keyword is necessarily harmful.

Hope you enjoyed my take on this one! Read you next time!



*Yes, there are properties in my interfaces .They are only getters to some data and not some space to hold this data. In other words, querying for a state like IsRejected is not the state itself.