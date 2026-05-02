# TaskFlow — Team Management Made Simple

Hey there! This is a project I've been working on to solve the common headache of team coordination. It's a full-stack MERN app designed to be clean, fast, and actually useful for day-to-day project tracking.

I built this because I wanted something that felt more like a modern SaaS product (think Linear or Stripe) rather than a cluttered legacy tool.

## What it actually does

*   **Real-time sync**: I used Socket.io so when you assign a task or change a status, the other person gets a notification immediately without refreshing.
*   **Smart Dashboard**: A bird's-eye view of everything—Total tasks, what's pending, what's done, and importantly, what's overdue.
*   **File Handling**: You can drop images, PDFs, or docs directly into tasks. I've integrated Cloudinary to handle the heavy lifting for storage.
*   **Role Management**: Simple but effective. Admins handle project creation and team management; Members focus on getting their tasks done.
*   **Automatic Reminders**: There's a cron job running in the background that checks for overdue tasks every night and sends out email alerts so nothing slips through the cracks.

## Tech I used

I went with the MERN stack because it's reliable and fast to iterate on:
*   **Frontend**: React with Vite (super fast HMR) and plain CSS for that custom, premium feel.
*   **Backend**: Node.js & Express.
*   **Database**: MongoDB with Mongoose.
*   **Real-time**: Socket.io.
*   **Emails**: Nodemailer + Node-cron for the scheduling.

---

## Setting it up locally

If you want to run this on your machine, here’s the quick way to get it going.

### 1. Get the code
```bash
git clone <repository-url>
cd team-task-manager
```

### 2. The Server (Backend)
Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```
You'll need a `.env` file. I've left a list of what you need below. Just copy-paste this into a new `.env` file in the `server` directory and fill in your keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=something_random_and_secure
CLIENT_URL=http://localhost:5173

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email (for overdue alerts)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="TaskFlow <your_email@gmail.com>"
ADMIN_EMAIL=your_email@gmail.com
```

### 3. The Client (Frontend)
Open a new terminal, go to the client folder, and install:
```bash
cd client
npm install
```

---

## How to run it

I usually run two terminals side-by-side:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

Once both are running, head over to `http://localhost:5173`.

### Quick Tip 💡
If you want to see what the app looks like with actual data, I wrote a seed script. Just run `npm run seed` inside the `server` folder. It'll wipe the DB and fill it with a professional-looking demo project and some sample tasks.

## Some things to note
*   **Google Login**: Currently a UI placeholder. I'm planning to add Passport.js integration for this soon.
*   **Emails**: Make sure you use a Gmail "App Password" if you're using a personal Gmail account, otherwise, it might block the connection.

Feel free to reach out if you have questions!
