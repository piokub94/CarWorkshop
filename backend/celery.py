import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

from celery.schedules import crontab

app.conf.beat_schedule = {
    'create-slots-daily': {
        'task': 'booking.tasks.create_time_slots',
        'schedule': crontab(minute=0, hour=0),  # zadanie uruchamiane codziennie o północy
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
