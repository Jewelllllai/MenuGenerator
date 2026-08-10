# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn python-multipart pillow
pip install pytest httpx
pip install groq python-dotenv

# Frontend
cd frontend
pnpm install
pnpm install axios
pnpm run dev
pnpm add -D typescript @types/react @types/react-dom