FROM python:3.7.2
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN export FLASK_ENV=development
ENTRYPOINT [ "python" ]
CMD ["app.py" ]