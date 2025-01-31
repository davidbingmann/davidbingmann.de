FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

# Systemabhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

# UV installieren & virtuelle Umgebung
RUN pip install --no-cache-dir uv==0.1.40 && \
    python -m uv venv /opt/venv

# PATH setzen für virtuelle Umgebung
ENV PATH="/opt/venv/bin:$PATH"

# Abhängigkeiten installieren
COPY pyproject.toml .
RUN uv pip install --no-cache -r pyproject.toml

# Finales Image
FROM python:3.11-slim-bookworm

WORKDIR /app

# Nur notwendige Runtime-Abhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Virtuelle Umgebung kopieren
COPY --from=builder /opt/venv /opt/venv

# Umgebungsvariablen setzen
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# App-Code kopieren
COPY . .

# Nicht-root User
RUN useradd -u 1001 -d /app -s /bin/false appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


