"""
Django settings for backend project.
"""

import os
from pathlib import Path
from celery.schedules import crontab
import environ

# Inicjalizacja django-environ
env = environ.Env()

# Wczytaj plik .env jeśli istnieje (lokalnie)
if os.path.exists(os.path.join(Path(__file__).resolve().parent.parent, '.env')):
    environ.Env.read_env(os.path.join(Path(__file__).resolve().parent.parent, '.env'))

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = env.str('SECRET_KEY')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Jeśli w produkcji i znasz publiczny domen Railway
if not DEBUG:
    RAILWAY_PUBLIC_DOMAIN = env.str('RAILWAY_PUBLIC_DOMAIN', None)
    if RAILWAY_PUBLIC_DOMAIN:
        ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'backend.booking',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'phonenumber_field',
    'django_celery_beat',
    'django_celery_results',
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # musi być pierwszy
    "django.middleware.common.CommonMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'dist')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# --- CELERY ---
CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Europe/Warsaw"
CELERY_BEAT_SCHEDULE = {
    "create-daily-time-slots": {
        "task": "backend.booking.tasks.create_time_slots",
        "schedule": crontab(hour=0, minute=0),
    },
    "send-reminder-sms": {
        "task": "backend.booking.tasks.send_reminder_sms",
        "schedule": crontab(minute=0, hour="*"),
    },
}
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_RESULT_BACKEND_ALWAYS_READY = True

# --- TWILIO ---
TWILIO_ACCOUNT_SID = env.str('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = env.str('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = env.str('TWILIO_PHONE_NUMBER')

# --- DATABASE ---
DATABASES = {
    'default': env.db()
}

# --- PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNATIONALIZATION ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Warsaw'
USE_I18N = True
USE_TZ = True

# --- STATIC FILES ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- CORS ---
CORS_ALLOWED_ORIGINS = [
    "https://reasonable-smile-production-6dc0.up.railway.app",
    "http://localhost:3000",
]

# --- REST FRAMEWORK CONFIGURATION ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'backend.authentication.CsrfExemptTokenAuthentication',  # nasza klasa
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
    'TEST_REQUEST_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
