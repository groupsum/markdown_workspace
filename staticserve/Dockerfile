FROM python:3.12

WORKDIR /app

RUN pip install --no-cache-dir --upgrade uv

COPY ./staticserve /app/staticserve

RUN uv pip install --system --no-cache-dir /app/staticserve

COPY ./client/dist /app/dist

EXPOSE 80

RUN ls
CMD ["uvicorn", "staticserve:app", "--host", "0.0.0.0", "--port", "80"]
