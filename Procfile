release: python manage.py migrate --noinput && python manage.py collectstatic --noinput
web: gunicorn --bind 0.0.0.0:$PORT backend.wsgi
worker: celery -A backend worker --loglevel=info --concurrency=2
beat: celery -A backend beat --loglevel=info
