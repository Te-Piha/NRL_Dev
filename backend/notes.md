## Backend Setup

1. Create or activate a virtual environment:
   - `python3 -m venv venv`
   - `source venv/bin/activate`
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run the API locally:
   - `python app.py` (binds to `0.0.0.0` on `PORT` env var or 5000).

## Deployment Notes

- Render will install dependencies via `pip install -r requirements.txt` and can be started with `gunicorn app:app`.
- The API writes state to `storage.json`. Render’s disk is ephemeral, so consider moving persistent data to a hosted store before production use.
