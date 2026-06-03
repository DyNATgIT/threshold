# THRESHOLD Agent Backend — Cloud Run

A small Cloud Run service that writes live blackboard updates to Firestore.

## Endpoints

- `GET /health`
- `POST /trigger/baseline`
- `POST /trigger/wind-shift`
- `POST /trigger/bridge-collapse`
- `POST /decision/approve`
- `POST /decision/reject`

## Environment variables

- `BLACKBOARD_COLLECTION=current_crisis_state`
- `BLACKBOARD_DOC=active`
- `ALLOWED_ORIGINS=*` for quick demo, or your Vercel URL for safer CORS.

## Deploy from Cloud Shell

```bash
cd backend

gcloud run deploy threshold-agent-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BLACKBOARD_COLLECTION=current_crisis_state,BLACKBOARD_DOC=active,ALLOWED_ORIGINS=*
```

Cloud Run uses the service account of the selected Google Cloud project. Grant that service account Firestore access if needed.
