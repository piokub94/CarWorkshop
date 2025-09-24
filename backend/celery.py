import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Tworzymy sloty od razu po starcie
    sender.send_task('backend.booking.tasks.create_time_slots')

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')