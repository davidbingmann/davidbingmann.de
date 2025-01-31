FROM python:3.11-slim

WORKDIR /app

# 1. Systemabhängigkeiten mit Cleanup
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 2. UV installieren und virtuelles Environment aktivieren
RUN pip install --no-cache-dir uv
RUN python -m uv venv --seed
ENV PATH="/app/.venv/bin:$PATH"

# 3. Abhängigkeiten installieren (mit expliziter uvicorn-Installation)
COPY pyproject.toml .
RUN uv pip install --no-cache -r pyproject.toml "uvicorn[standard]"

# 4. Anwendungscode kopieren
COPY . .

EXPOSE 8000
CMD ["uvicorn", "dein_main_module:app", "--host", "0.0.0.0", "--port", "8000"]

