## Requirements

Install the following before running the project:

- Python 3.10 or later
- Node.js and npm
- Git
- Google Chrome recommended for voice input

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd VoxaSign-AI

Backend Installation
Open Terminal 1:
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

Frontend Installation
Open Terminal 2 from the project root:
cd frontend
npm install

How to Run the Project
Start the Backend
In Terminal 1:
cd backend
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000

The backend will run at:
http://127.0.0.1:8000

FastAPI documentation is available at:
http://127.0.0.1:8000/docs

Start the Frontend
In Terminal 2:
cd frontend
npm run dev

Open the application in a browser:
http://localhost:5173

Google Chrome is recommended for voice input. Allow microphone access when prompted.
Running the Evaluation
Keep the backend running. Open a third terminal:
cd backend
source .venv/bin/activate
python evaluate.py

Expected result:
Correct predictions: 30/30
Context accuracy: 100.00%