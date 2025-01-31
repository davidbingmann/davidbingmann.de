# Basis-Image mit Python 3.11-slim für eine schlanke Umgebung
FROM python:3.11-slim

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Installiere uv für schnelle Paketinstallation
RUN pip install uv

# Kopiere nur pyproject.toml und poetry.lock zuerst, um den Cache besser zu nutzen
COPY pyproject.toml /app/

# Installiere Abhängigkeiten mit uv
RUN uv pip install --system

# Kopiere den restlichen Code ins Image
COPY . /app

# Starte die Anwendung
CMD ["python", "main.py"]