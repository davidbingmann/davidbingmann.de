FROM python:3.11-slim

WORKDIR /app

# 1a. Systempakete für Build
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev

# 1b. UV installieren und Umgebung erstellen
RUN pip install uv && uv venv

# 1c. Aktivierung der virtuellen Umgebung
ENV PATH="/app/.venv/bin:$PATH"

# 2. Abhängigkeiten installieren
COPY pyproject.toml .
RUN uv pip install -r pyproject.toml

# 3. Anwendungscode kopieren
COPY . .

# 4. Port und Startbefehl
EXPOSE 8000
CMD ["uvicorn", "dein_module:app", "--host", "0.0.0.0"]
