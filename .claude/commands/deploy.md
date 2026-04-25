# Command: Deploy

## 🚀 Deployment Targets
- **Frontend:** Vercel
- **Backend:** Hugging Face Spaces (Docker or Streamlit template for FastAPI)

## 🛠 Deployment Steps
1. **Frontend:**
   - Run `npm run build` to verify the production build.
   - Deploy to Vercel using the Vercel CLI or Git integration.
2. **Backend:**
   - Ensure `requirements.txt` is updated.
   - Push to the Hugging Face Space repository.
3. **Environment Sync:**
   - Verify `GROQ_API_KEY`, `DATABASE_URL`, and `NEXT_PUBLIC_API_URL` are set in the production environment.

## ✅ Post-Deployment
- Run smoke tests on the production URL to ensure the `/analyze` endpoint is functional.
