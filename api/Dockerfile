FROM python:3.7.2

# Setup a spot for the api code
WORKDIR /usr/local/src/skiff/app/api

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy over the data that makes up the corpus
WORKDIR /usr/local/data/skiff/
ARG DATA_ARCHIVE=20190806_01.tar.gz
ENV SUPPAI_DATA_ARCHIVE ${DATA_ARCHIVE}
ADD https://storage.googleapis.com/supp-ai-data/${DATA_ARCHIVE} /usr/local/data/skiff
RUN tar -xvf ${DATA_ARCHIVE} && rm ${DATA_ARCHIVE}

WORKDIR /usr/local/src/skiff/app/api

# Copy over the source code
COPY app app/

# This enables the Flask debugger and activates code that restarts the
# API as you make changes
ARG FLASK_ENV=development
ENV FLASK_ENV ${FLASK_ENV}

# This allows imports in our API to be fully qualified, i.e. `from app.api`
# rather than `from api`.
ENV PYTHONPATH "/usr/local/src/skiff/app/api:${PYTHONPATH}"

# Kick things off
ENTRYPOINT [ "python" ]
CMD [ "app/start.py" ]
