FROM python:3.11-slim as builder

WORKDIR /app
RUN pip install uv==0.1.44

# Virtuelle Umgebung explizit erstellen
RUN python -m uv venv /venv
ENV PATH="/venv/bin:$PATH"

COPY pyproject.toml .
RUN uv pip install -r pyproject.toml

FROM python:3.11-slim
WORKDIR /app

# Virtuelle Umgebung kopieren
COPY --from=builder /venv /venv
ENV PATH="/venv/bin:$PATH"

COPY . .

CMD ["uv", "run", "main.py"]



