Tabulations
===
Tabulations is a self-improvement tool that i wrote because i was struggling a lot with staying accountable to myself and consistent in my routine, and i want a good way to see how i am progressing in my self-improvement journey.



it has a few different functionalities:


Personal time reporting
---
The point here is to be able to report and then later visualize how exactly you spend your time. 
In this day and age, it's extremely easy to waste time, one minute your taking a break from your studying and the next you've scrolled Youtube for 3 hours. 
And that's the point of this tool, to keep yourself accountable and know exactly how you spend your time, and as a secondary side-effect: you don't want to report the fact that you threw away 3 hours doing exactly nothing, so this tool might make you less likely to do it. 

The time reporting works by you configuring your own activities, you can specify a number of different parameters for a newly configured activity such as the amount of time that you'd _prefer_ to spend
on the activity everyday or if the activity is a negative activity, how much time is the _maximum_ you want to spend on it each day. 

![time_editor](https://github.com/JBaltimore47/tabulations/assets/139618954/fcd5b3a9-d199-4d03-8818-c5d6794b74fb)




Checklists
---
Ever had a goal to do 20 pushups everyday? Or maybe you wanted to read 20 pages every day, regardless the point here is to provide a neat way for you to set up and report on those checklists.  

![day_view](https://github.com/JBaltimore47/tabulations/assets/139618954/904ef15f-9193-478c-90da-10a6da2d0051)


Times
---
Ever set a goal for yourself to go up at a specific time and go to sleep at another? Have you ever tried intermittent fasting and set a goal to only eat food after a certain time of the day. 
This allows you to set up your own times, and then as with the other functions, you report on them. For example: i might want to go up 6AM everyday and do math, but that's not always possible,
some times you can't sleep, some times you've stayed up all night with friends, etc. I would like to keep track of and visualize how often i fail to do so. If i fail to often then i know i have to make some change in my life.

Counts
---
Ever had a goal to only drink 2 coffees every day? Or perhaps you're doing some variant of nofap and only allow yourself to flap the spank every 3 days, well, here you can configure your own
daily counts. For example: how many coffees did i drink today? i won't whip myself on the back for drinking more than 2, but i'd like to visualize just how badly i'm failing with my goal. 


Journals
---
Are you like me and hate writing shit down using a pen and paper, and would rather have all of your journals in one digital location that you can easily backup. This allows you to create journals, add entries to those journals, and visualize all of your entries with a good looking timeline. 

_Entries of a specific journal_
![journal_timeline_2](https://github.com/JBaltimore47/tabulations/assets/139618954/703e66b7-f561-4391-bc1d-8faf1be4a16a)


_Edit journal entry_
![journal_view](https://github.com/JBaltimore47/tabulations/assets/139618954/e5b88e50-7346-4197-be28-658d32508d8d)

 
Info
---
This tool is written in Django rest framework and React. 
It only stores data locally in a sqlite3.db file, this is one of the reasons i made this, because trusting a corporation that might've already made a product like this, with this kind of personal information, is a no-go for me.
I primarily wrote this tool for my own use, so i am only adding new functionalities as i recognize the need for them in my own life, feel free to fork the repo or contact me if you want to contribute to a better product. 
As it stands, the code isn't pretty, there are bugs and a lot of functionality is missing, so i'm sorry if you're planning on reading and understanding it. The main functionality works as intended, which is personally all i need. But i wouldn't say no if someone wanted to swoop in and fix some things.

What i think is nice about this tool is a) you have full control over all activities and checklists, nothing is generic, and b) you can utilize only the parts of the tool you want. If you only want to report time with no checklists, counts or journaling, that's fine.












