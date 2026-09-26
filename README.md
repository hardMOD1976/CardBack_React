# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a81d9d86-da45-449a-add5-4184b47c9a16

## Run Locally

**Prerequisites:** Node.js 22.12 or newer and npm.


1. Install dependencies:
   `npm install`
2. Create a local `.env` file from `.env.example`. Set `DATABASE_URL` to your PostgreSQL connection string and `GEMINI_API_KEY` if you want to use AI features. Set `JWT_SECRET` to a random value of at least 32 characters.
3. Run the app:
   `npm run dev`
