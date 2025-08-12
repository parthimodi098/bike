# Deploying Torq-Rides Frontend to Vercel

This guide outlines the steps to deploy the Torq-Rides frontend to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your client code
- Node.js installed on your local machine

## Deployment Steps

### 1. Prepare your environment variables

Create a `.env.production` file in the client directory with:

```
NEXT_PUBLIC_API_URL=https://your-aapanel-domain.com/api/v1
```

Replace `your-aapanel-domain.com` with your actual backend domain.

### 2. Push your code to GitHub

If your code isn't already in a GitHub repository:

```bash
cd client
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/torq-rides-frontend.git
git push -u origin main
```

### 3. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: client
   - Environment Variables:
     - NEXT_PUBLIC_API_URL: https://your-aapanel-domain.com/api/v1
5. Click "Deploy"

#### Option 2: Using the Vercel CLI

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Navigate to your client directory
   ```bash
   cd client
   ```

3. Login to Vercel
   ```bash
   vercel login
   ```

4. Deploy your project
   ```bash
   vercel
   ```

5. Follow the prompts to configure your project
   - Set the environment variables when prompted

## After Deployment

1. Your frontend will be deployed to a URL like `your-app-name.vercel.app`
2. Make sure to update the backend `.env.production` file with this URL for the `CLIENT_URL` and `CORS_ORIGIN` settings
3. Test the application to ensure the frontend can communicate with the backend

## Custom Domain (Optional)

To use a custom domain:

1. In your Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain and follow the verification steps

## Troubleshooting

- If you encounter CORS issues, ensure that your backend environment variables properly include the Vercel domain
- If cookies aren't working correctly, verify that your cookie settings use `sameSite: 'none'` and `secure: true`
