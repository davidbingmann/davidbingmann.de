FROM python:3.11-slim

WORKDIR /app

# Systemabhängigkeiten & PDM installieren
RUN pip install uv && apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

COPY pyproject.toml pyproject.lock ./

# PDM installieren
RUN pip install pdm

# Abhängigkeiten installieren
RUN pdm install

COPY . .

# Port freigeben und Befehl ausführen
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]