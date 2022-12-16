---
layout: post
title:  "What is Architecture"
date:   2022-12-01 00:00:00 -0500
categories:
---

I had an interesting conversation with a random person on the internet. We were talking about the merits behind
specialized titles like "architect" or "tech lead". Titles that comes with some prestige, responsibilities, and
hopefully the right salary. They were pretty adamant on defending their existence. At one point, they even suggested
that, at their company, things wouldn't get done without them. I couldn't resist the laugh. Let's talk about the idea
of architecture in software, and why these titles are misleading at best, and toxic at worse.

## The Job Description

Have you noticed how, no matter where you look, everyone seems to have their own definition of Junior, Intermediate,
Senior, Team Lead, Tech Lead, and Architect? I worked at a large broadcasting corporation in the past and, officially, I
was an architect there. In reality, my job was closer to the one of a Tech Lead. I had to make technical decisions on
how to structure projects, and what were the best tools for the job, while coaching the team on best practices to ensure
they could actually use these unfamiliar tools. Because of this coaching role, at times, I acted as a Scrum Master,
where I guided the team toward improving their process and supported them with information from our clients as they got
blocked on tasks. Because of those client facing interactions, I also acted as Product Owner. With a strong knowledge of
their requirements, of the technical needs for the project, and of the capabilities of my team, I could prioritize
stories in a way that meant we could deliver as much value as we could early-on. From time to time, the department would
get a new project, and it was up to me to run an early analysis and call for a budget estimate to get going; in that
state, I acted as an Analyst.

Today, I got an offer for a new position on LinkedIn. That offer was also for an architect position. It turns out that,
by spending 10 seconds looking at the opening, they looked for someone to analyze the client's needs and build
documentation for the team to use during their sprints. While they were looking for something with strong knowledge of
modern technologies, there isn't any mention of coding abilities. I don't think I need to get into the details just to
tell you how different these two roles are, and yet, they have the same name!

So, what is an "architect", really? Maybe it won't surprise you that, most people don't know! And by that, I mean that
they don't even know what they do in the traditional sense of the term... in the construction industry! Remember that
discussion I had? This person used an analogy with actual architects to try and explain the value that their position
brings to their company. To paraphrase a little, they mentioned how architects had the responsibility of choosing the
right type of materials for the building, the right concrete for it to stand strong, the right building methods, etc.

## Bathing in concrete

That's what architects do... right? Well, usually this is what an "engineering firm" does, but they aren't usually
composed of only architects. There's a reason they are called *enginnering* firms and not *architecting* firms, after
all. It turns out that picking the right material and building methods and usually the job of an engineer, and not of an
architect. So what *do they do*?

[Dami Lee](https://www.youtube.com/@DamiLeeArch) is an actual architect and her YouTube channel is abusively interesting
to watch. It's those kind of channels that manages to go really deep into the topic, while keeping it at a birds eye
level to make it accessible. Wouldn't you know, it doesn't surprise me one bit. After watching hours of her creations, I
can safely say that, as an architect, she has the perfect skill-set for that. There's something she said in her video on
[the use of architecture in famous sci-fi movies](https://www.youtube.com/watch?v=8go_xBWa_EA) that really resonated
with me:

> [On Inception]
> A lot of the things that they're saying is really accurate of the process of design. A lot of the times when you start
> designing, you don't really know what it's going to look like. And so, as you go through these different options and
> through different sketches and models, you'll see what works and what doesn't work, and you'll see where the design
> wants to go. So, it's really a process of discovery, I guess.
> 
> [On the power of dreams over real life]
> In architecture, [there is this concept] called haptic architecture. It's when you incorporate all of these different
> [normally missing] senses into your spatial experience. You know, we should really all be designing for all of these
> senses. But when you design for your haptics, not just your visual, it makes your experience of the space much, much
> stronger, and it really solidifies that space in your mind.

Did you notice? How she describes her work as designing buildings? As discovering what the structure wants to be? As
touching every aspect of our being, instead of focusing only on what we can see? Doesn't it remind you of something?
Maybe, the role of a painter, or manga artist, or writer? The role of a movie director or a game director? Maybe...

> The Agile Manifesto
>   
> Individuals and interactions *over processes and tools*  
> Working software *over comprehensive documentation*  
> Customer collaboration *over contract negotiation*  
> Responding to change *over following a plan*  

That is, while there is value in items on the right, the economics, we value the items on the left more, the process of
creation.

## Software Architecture
Anyone can design an apartment complex, at least at a decently high level. An architect, however, will take the idea of
a living space and see the need for calmness, the need for creativity, the need for privacy, the need for community, the
need for interactions, the need for communication, the need for accessibility, the need for affordability, the need for
safety, and everything else I might be missing, and find a way to reconcile all of those aspects together into a single
package, as best as the existing resources can provide.

Where a civil architect attempts to create a space that is imbued with a purpose while staying connected to our human
needs, software architects attempts to create a product that is imbued with a purpose while staying connected to our
human needs. Software architecture is about seeing what makes a product great, what makes an app go from useful to
delightful, what takes a website from useful to you, to useful for everyone. It is a role of creation and discovery.
It's about knowing how much bread you have in your bag and where to place the next breadcrumb to maximize your
exploration of the needs of your users. It's about looking ahead from up high while communicating the challenges for the
people on the ground. It's also about knowing how far to look, when to stop, turn around.

While creativity is a similar process in every field, software engineering isn't the same as civil engineering. The real
world is slow. The virtual world is incredibly fast. While the distance from your home to the next city might make sense
to you, the distance from the Earth to the Sun is unfathomably large. The gap is so big between the two, the sun might
be gone for 7 minutes already, and there would be no way for you to know it. That's how large the difference between the
speed of experimentation is between civil and software engineering. It takes months and years for a building to rise,
but it takes seconds for a docker container to spin up and replace the previous one.

This is why architecture in software isn't about documenting where we are going; no human could ever get there slowly
enough for it there be any value in documenting the process in the first place. No, instead, it's about trying, making,
inspecting, and iterating.

The best architects in software are those who know how do to this quickly, not those who know how to write the cleanest
code, or the most detailed requirements, or the most precise estimates, or those who makes the prettiest UIs.

## For a standard definition of the role
I think it is about time that we defile what is the role of a software architect for the Agile era. Agility frowns at 
the idea of job titles, and with reason, but as developers, we still play multiple roles in our team. For this reason, I
think we, as an industry, needs a proper description of the role of software architect; a description that works hand in
hand with the modern idea of software development. This is my proposition:

> A developer takes the role of architect whenever they step back from the execution of the code and look at the
> overwhelming amount of aspects impacting the project with the goal of increasing or reducing its presence in the final
> product.

This role, as essential as it sounds, cannot exist in an Agile team without true collaboration and fast iteration.

Hopefully you like my take on this and will have some things to say about it. I'd love to revise this
definition, if you find a better angle to tackle the problem.

For now, that's all folks! Read yall later.