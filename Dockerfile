FROM python:3.11-slim

WORKDIR /app

# Systemabhängigkeiten & PDM installieren
RUN pip install uv && apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

COPY . .

# Abhängigkeiten installieren
RUN uv pip install -r requirements.txt

# Port freigeben und Befehl ausführen
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]