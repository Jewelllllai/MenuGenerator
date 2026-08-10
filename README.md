# Menu Generator

A modern full-stack web application for creating and managing menus with a clean, user-friendly interface. This project combines a React/Vite frontend with a Python backend API to provide a simple and practical experience for generating menu content.

> **Personal Project**: This repository showcases my own full-stack development work and reflects my interest in building interactive web applications with modern frontend and backend technologies.

## Demo

Watch the app in action: [Recipe Generator Demo](docs/demo/recipe-generator-demo.mp4)

## Features

- **Interactive Menu Creation**: Build and manage menus with a simple interface
- **Responsive Design**: Clean layout that works well across devices
- **Full-Stack Architecture**: Frontend and backend work together seamlessly
- **Modern Development Setup**: Built using React, Vite, and Python
- **Easy Local Development**: Simple setup for running the app on your machine
- **AI Image Analysis**: Upload a food image and use an API key to analyze it with AI, then generate cooking steps based on the detected ingredients and dish

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Backend**: Python, FastAPI
- **Styling**: CSS
- **Package Management**: pnpm

## Project Structure

```text
.
|-- backend/           # Python API server
|-- docs/demo/         # Demo video
|-- frontend/          # React/Vite application
`-- README.md          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js installed
- pnpm installed
- Python 3.10+ installed
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jewelllllai/MenuGenerator.git
   cd MenuGenerator
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```

   Create a `.env` file inside the `backend` folder and add your own Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=qwen/qwen3.6-27b
   ```

   You can create a Groq API key from your Groq account dashboard. The image recipe generation endpoint will not work without this key.

   The backend uses `qwen/qwen3.6-27b` by default because it supports image input. If your Groq account has access to Llama 4 Scout, you can use this instead:
   ```env
   GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   ```

3. **Start the backend server**
   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend must stay running at `http://127.0.0.1:8000` because the frontend sends recipe requests to that address.

   If PowerShell does not activate the virtual environment with `venv\Scripts\activate`, use:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

4. **Set up and start the frontend in a second terminal**
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

   If your first terminal is still inside `backend`, run this instead:
   ```bash
   cd ../frontend
   pnpm install
   pnpm run dev
   ```

## What This Project Demonstrates

- A practical full-stack application workflow
- Frontend-backend integration using modern tools
- Clean project structure for development and future expansion
- A simple but polished user experience for a real-world use case

## Notes

This project is a personal build created for learning and portfolio purposes. It reflects my approach to developing small web applications with a strong focus on structure, usability, and modern tooling.

## Author

**Jewel Lai**

## License

This project is open for personal and educational use.

---

*Last Updated: August 2026*
