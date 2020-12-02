FROM python:3.7.2

# Setup a spot for the api code
WORKDIR /usr/local/src/skiff/app/api

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy over the data that makes up the corpus
WORKDIR /usr/local/data/skiff/
COPY download_data.py .
ARG DATA_ARCHIVE=20201129_01.tar.gz
ENV SUPPAI_DATA_ARCHIVE ${DATA_ARCHIVE}
RUN python download_data.py -a ${DATA_ARCHIVE} -d /usr/local/data/skiff/
RUN tar -xvf ${DATA_ARCHIVE} && rm ${DATA_ARCHIVE}

WORKDIR /usr/local/src/skiff/app/api

# Copy over the source code
COPY app app/

# The API generates a sitemap, which we write to disk and serve from
# the filesystem. We need to make sure there's a spot for it on disk.
RUN mkdir -p static/sitemap

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
