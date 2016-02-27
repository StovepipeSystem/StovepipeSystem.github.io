---
layout: post
title:  "On problems and their domain"
date:   2013-07-17 20:39:00 -0500
categories:
---

A young man comes to you and says:  
- Here is a problem. Solve it.  
He leaves an enormous pile of little, irregular, completely white cardboard pieces on your desk then goes away. You know this is going to be a very long week as you start to looks for the borders of the puzzle.

At the end of the week, you managed to make out most of it. There is still a pile of shapes that simply goes nowhere. You know because you already tried them all in every single free spot. The only thing that comes to your mind is that they probably matches with the other pile of shapes that are missing from the puzzle. You scratch your head a little while looking at the hole-filled white board you managed to create, then the young man comes back.  
- Nice job, but I only wanted you to count the pieces...  
You swear.

---------------------------------------

Understanding a problem's domain can be really hard. Even more when there are missing pieces of information. They come in many shapes and forms. Make it questions that you asked to your client, SDK documentation, patterns and techniques or technologies, if you are missing just one word, you can miss the train by miles. This is why understanding the problem's domain is important before trying to fix it.

Here is a little trick you can use to help yourself in this tedious process: Break it down and link it together. Starts by writing down everything you know about the problem that you have to solve as a list of things you want your application to do. Lets say you want to create a dashboard for a couple of web services that you often use and just want to see all of the important information at a glance, this is what it might look like:

- Todos
- Birthdays
- Upcomming trends
- News highlights
- Friends updates

It is important to get everything right at this level first. If you are building an application for a client, make sure to ask all the questions that you need to build this list before going to the next step. This list will eventually form your backlog's user stories. If you develop your application correctly, it shouldn't be a problem to add a new item in this list. This is where the next step comes in. You have to choose the technologies you want to use to connect to those services:

- Microsoft Outlook API
- Twitter API
- Facebook API

They might be imposed by your client so again, make sure to ask questions to get this information. Just remember that is is always better to get an answer like "I have no clue what an API is." than no answer at all. This will clarify your options and make sure you talk about stuff that matters for your clients. Once you are done with the back end, start to talk about the front end. Choose the technologies that you will use to display the content:

- MVVM Light
- WPF

Again, they might not know anything about those, but they will probably care a lot about which platform you will be developing for so it might influence this list too.

Now that you have a good start, tries to draw them as a flow on a sheet of paper or a whiteboard. The goal is to align them with each other so that you can link them together with lines. If a component is already done, put a square around it. If you need to do something about it, keep the text floating. You should already start to see the different layers of your application with all the services at the left and all the display technologies at the right.

The next step is to connect each item together. Let us start from the left with "Todos". In the three providers that we want to support (Outlook, Twitter and Facebook) only one of them provides support for a todo list: Outlook. You might be tempted to draw a line between the two right away, but first, ask yourself if connecting the two really is straightforward for you. Don't try to think like an other programmer here. Ask yourself: is it really that easy? If you don't know how to get the list of tasks from outlook without Googling it, look it up and ask questions. Once you figure it out, draw the line with a box in the middle with some reference where you can find this information later. Do this for every single item on the board and don't be shy to add new ones. How will you display notifications? Do they need to be in real time? Do you have a straightforward way to handle real time data from facebook to a WPF UI element? You might need a few more items in there like "Reactive Extensions" (as a box) and "HomemadeObservablePresenterControl" (as floating text). Be as precise and deep as you need. If you use Rx or an observable presenter control every day, don't put it in there unless it is a major component of your application.

By now, you should have a pretty good idea of what you have to do and how you are going to do it. Time to schedule a new meeting with your client and show him your solution by explaining what every item in the flow does. Make sure they understand what is the "Facebook SDK for .NET" or who is this "Telerik" company making the cool "TileControl" you want to use. What are their licensing policy, the price, etc. If you are going the wrong way, you will know by the end of this meeting and you will be able to fix your plan before it gets expensive. The next step is to raise issues with your solutions as fast as possible, but this is an other story.

If the developer in my example would have used this little trick right away, his client would have understood that a "puzzle solver" that produce a nice picture at the end is not what a really wants: a "piece counter".

As always, read you later!