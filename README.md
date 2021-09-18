## Intro
The inspiration for this project is from a popular game called Genshin Impact. The game like many others eventually gets quite repetitive but I noticed that they used certain tricks to get players to keep doing these repetitive tasks. I did some research into video game design and discovered a lot of techniques that can be used to nudge people towards certain behaviors. So I decided to try to harness these techniques also called  gamification to a task list that people set and share with friends.

I believe one factor to determine the importance of a task is how others perceive this task. Thus one of the key functioanilites of the app is to let others rate the difficulty of the tasks you put into your handbook.

The design choice is made to imitate a old reliable notebook kept by an adventurer, the user.

## Database:
There are three main tables in my Database Schema:
**Adventurer**: stores full name, progress/exp,
battlepass level
**Tasks**: task_title, task_done, task_img,
created_by (references user, so a deleted user means his tasks are also wiped)
, task_difficulty, task_xp
**Ratings**
task_id (points to task)
task_difficulty, integer
rater (points to specific task, so a deleted task will cleanup ratings which now point to nothing)

to minimize databse load I calcualate a lot of things with client side javascript such as bp level by flooring bp xp divided by level xp cap.

each user may have multiple accounts, so they are linked to different adventurers

## Implementation
The main component of this app is a card that displays the created task. I needed to create re-usable card for each tasks which displayed all the task information in a clean and intuitive way. I wanted a lot of interactvity in the task card including being able to edit the image, rating, and task title.

Of course to keep things secure, only the owner of a task is able to edit it. With both checks on client side and signed urls.

The main collobration aspect is helping your friends decide the relative importance of tasks. And users are awarded a little bit of xp to encourage rating other's tasks as well as working on their own.

To access other people's pages I built a pseudo-router in controller.py which uses user id to pull up a user's tasks.

It was challenging to do the entire project by myself based off just lectures and slack, but it was quite rewarding. I made sure to put in small touches to make the task list feel more like an relaxing game rather than just work. However following the design principles I set for myself, I made sure everything was clear while still looking playful.
