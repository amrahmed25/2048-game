# 🎮 2048 Game

**A modern and interactive 2048 puzzle game with user authentication, player statistics, and a global leaderboard.**

Challenge yourself, combine matching tiles, beat your high score, and compete with other players!

## ✨ Features

* **Classic 2048 Gameplay** — Combine tiles with the same number to reach 2048 and beyond.
* **User Authentication** — Sign up and log in to access the game and save your progress.
* **Player Dashboard** — Track your gaming performance and personal statistics.
* **Global Leaderboard** — Compete with other players based on their highest scores.
* **Player Statistics** — Track games played, wins, losses, best scores, and highest tiles.
* **Persistent Data** — Store player profiles and game statistics using Supabase.
* **Responsive Design** — Enjoy the game across different screen sizes.
* **Real-Time Backend Integration** — Use Supabase services to manage user data and backend operations.

## 🛠️ Tech Stack

| Technology               | Purpose                       |
| ------------------------ | ----------------------------- |
| HTML5, CSS3 & JavaScript | Frontend development          |
| Tailwind CSS             | Responsive styling and UI     |
| Supabase                 | Backend services and database |
| Supabase Auth            | User authentication           |
| PostgreSQL               | Data storage and management   |
| Vercel                   | Deployment and hosting        |

## 🎯 How to Play

1. Create an account or log in.
2. Start a new game.
3. Use the arrow keys on your keyboard to move the tiles.
4. Tiles with the same number merge into one when they collide.
5. Each successful merge increases your score.
6. Keep combining tiles to reach 2048 and achieve a higher score.
7. Track your performance and compare your results on the leaderboard.

**Goal:** Reach the 2048 tile while achieving the highest score possible!

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* [Git](https://git-scm.com/)
* A modern web browser
* Node.js and npm, if your project uses a Node.js-based build setup

### Installation

**1. Clone the repository**

```bash
git clone YOUR_REPOSITORY_URL
```

**2. Navigate to the project directory**

```bash
cd YOUR_PROJECT_FOLDER
```

**3. Install dependencies**

If your project uses npm:

```bash
npm install
```

**4. Configure environment variables**

If your project uses environment variables, create a `.env` file in the project root and add the required configuration.

For a Vite project using Supabase, the variables may look like this:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Use the variable names expected by your actual application. Never expose your Supabase service-role key or other privileged secrets in frontend code.

**5. Start the development server**

For a Vite project:

```bash
npm run dev
```

Open the local URL displayed in your terminal to start playing.

> **Note:** The installation commands and environment variables above assume a Vite-based setup. Adjust them if your project uses a different configuration.

## 🗄️ Backend & Database

The application uses Supabase to support backend functionality, including:

* User account management and authentication.
* Player profiles and personal information.
* Game statistics and high scores.
* Leaderboard data and player rankings.
* PostgreSQL database operations.
* Row Level Security (RLS), where configured, to protect user data.

Database policies and authentication settings should be configured appropriately before deploying the application.

## 📊 Player Progress

The game can track important statistics such as:

* Total games played.
* Games won and lost.
* Highest score achieved.
* Highest tile reached.
* Total playing time.
* Current and longest winning streaks.

These statistics help players monitor their progress and improve their performance over time.

## 🌐 Live Demo

**Play the game:** [(https://2048-game-ten-iota.vercel.app/)]

**Source Code:** [(https://github.com/amrahmed25/2048-game)]

## 🔒 Security

* Keep privileged API keys and secrets out of frontend code.
* Configure Supabase Row Level Security policies for protected database tables.
* Validate user permissions before allowing changes to player statistics.
* Configure authentication redirect URLs for your production domain.

## 👨‍💻 Developer

**Amr Ahmed**

Frontend Developer | Computer Science Student

* GitHub: [@amrahmed25](https://github.com/amrahmed25)
* LinkedIn: [Amr Ahmed](https://www.linkedin.com/in/3mrahmed/)

---

**If you enjoy the project, consider giving the repository a star!** ⭐
