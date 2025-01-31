FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app


ENV UV_LINK_MODE=copy
ENV UV_COMPILE_BYTECODE=1
ENV UV_PYTHON_DOWNLOADS=never
ENV PYTHONPATH=/app


RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=/app/uv.lock \
    --mount=type=bind,source=pyproject.toml,target=/app/pyproject.toml \
    uv sync --frozen --no-install-project


COPY . /app


RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen


EXPOSE 8000  # Oder der Port, den deine Anwendung verwendet

# Startbefehl
CMD ["uv", "run", "main.py"]