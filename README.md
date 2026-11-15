# Doomscroll Duel

Challenge your friends to see who can use their phone the least! Use your competitive drive as a means of staying off your phone.

> Built for HackUMass XIV. **Android only.**

- **Demo video:** [[VIDEO LINK]](https://youtu.be/WFFug_8RlhQ)
- **Download the APK:** https://drive.google.com/file/d/168HX55O8NPkwria-aQM2tKcivCQPL-Gr/view?usp=sharing
- **Devpost:** https://devpost.com/software/doomscroll-duel

## Inspiration

My roommate and I had serious screen addiction problems. So we competed to see who could use their phone the least over the span of one week. It ended up having tremendous results, with both of us using our phone for less than 10 hours over the span of the whole week. I thought I would bring this idea to life in a mobile app to gamify staying off your phone.

## What it does

Doomscroll Duel is an app where you challenge your friends to a screentime battle. It tracks your screen usage and compares it with your opponent's. You add friends by username, set a daily goal, and challenge them to battles with a chosen length, excluded apps and stakes. The home screen shows a 7-day chart, your streak and a leaderboard.

## Try it

1. On an Android phone, download the APK from the link above.
2. Open the file and allow **Install unknown apps** when Android asks. If Google Play Protect warns that the app was not scanned, tap **Install anyway**.
3. Create an account (any email and password) and pick a username and a daily goal.
4. Grant **Usage Access** when prompted (Profile has a button too). The app needs it to read your real screen time.
5. To try a battle you need a second account: add a friend by username, then send them a challenge.


## How I built it

I used React Native in VS Code and Android Studio emulator to test the app through development. I also used Firebase as my database, allowing for account creation, adding friends, and storing screen time data. The UI is modeled on the "Leaderboard Spinning App Gamified" kit from the Figma Community, by Pritam Maji.

**Tech:** React Native (TypeScript), Kotlin (native `UsageStats` module), Firebase Authentication and Cloud Firestore, Android Studio.

## Challenges I ran into

Getting accurate screen time. Android's aggregated usage stats overcounted by about 100 minutes compared with Digital Wellbeing. I caught the mismatch by checking against Digital Wellbeing app by app, then worked with Claude to write a native Kotlin module that reads raw usage events and ends sessions when the screen turns off, and I tested it on my phone until the numbers matched. Coming from web React, I also had to learn native Android setup, permissions, and Firestore security rules, since the app has no backend server.

## Accomplishments that I'm proud of

The app works end to end on real phones: accounts, friend requests, battle invitations, and live syncing through Firestore, using real screen time. It ships as an installable APK.

## What I learned

I spent two months leading up to this event learning React from an online tutorial series, and this project taught me native Android modules, permissions and Firestore security rules. I think it's safe to say the tutorials paid off. I am quite happy with my progress in this project, as well as my individual skills.

## What's next for Doomscroll Duel

Release on the Google Play Store, as well as developing an iOS version (harder because of Apple restrictions). Also on the list: background syncing, push notifications for challenges, and privacy rules so players can only read data from friends they battle.

## Credits

- UI design inspired by the "Leaderboard Spinning App Gamified" kit on the Figma Community, by Pritam Maji.
- Font: Plus Jakarta Sans.
