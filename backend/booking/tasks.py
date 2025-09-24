from celery import shared_task
from django.utils import timezone
from datetime import timedelta, time
from django.db import IntegrityError

from backend.booking.models import Appointment, TimeSlot
from backend.booking.utils.sms import send_sms


@shared_task
def send_confirmation_sms(appointment_id):
    """Wyślij SMS po utworzeniu rezerwacji."""
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        if appointment.phone_number:
            message = (
                f"Twoja rezerwacja w warsztacie została potwierdzona "
                f"na {appointment.slot.date} o {appointment.slot.time.strftime('%H:%M')}."
            )
            send_sms(str(appointment.phone_number), message)
    except Appointment.DoesNotExist:
        pass


@shared_task
def send_reminder_sms():
    """Wyślij przypomnienie SMS 24h przed terminem wizyty."""
    now = timezone.now()
    reminder_time = now + timedelta(hours=24)
    upcoming_appointments = Appointment.objects.filter(
        slot__date=reminder_time.date(),
        slot__time__hour=reminder_time.hour,
        slot__time__minute=reminder_time.minute,
    )
    for appointment in upcoming_appointments:
        if appointment.phone_number:
            message = (
                f"Przypomnienie: jutro o {appointment.slot.time.strftime('%H:%M')} "
                f"masz wizytę w warsztacie ({appointment.get_service_type_display()})."
            )
            send_sms(str(appointment.phone_number), message)


@shared_task
def test_confirmation_sms(phone_number="+48123456789"):
    """Test wysyłki SMS potwierdzającego (na fejkowy numer)."""
    message = "✅ Test: Twoja rezerwacja została potwierdzona."
    send_sms(str(phone_number), message)
    return f"Confirmation SMS sent to {phone_number}"


@shared_task
def test_reminder_sms(phone_number="+48123456789"):
    """Test wysyłki SMS przypominającego (na fejkowy numer)."""
    message = "✅ Test: Przypomnienie o wizycie jutro o 10:00."
    send_sms(str(phone_number), message)
    return f"Reminder SMS sent to {phone_number}"


@shared_task
def create_time_slots():
    """Tworzy sloty na kolejne 90 dni od dziś, w godzinach 9:00-16:30 co 30 minut."""
    start_date = timezone.localdate()
    end_date = start_date + timedelta(days=90)

    for single_date in (start_date + timedelta(n) for n in range((end_date - start_date).days + 1)):
        if single_date.weekday() in [5, 6]:  # weekendy pomijamy
            continue

        for hour in range(9, 17):
            for minute in (0, 30):
                slot_time = time(hour, minute)
                try:
                    TimeSlot.objects.get_or_create(
                        date=single_date,
                        time=slot_time,
                        defaults={'is_booked': False}
                    )
                except IntegrityError:
                    # jeśli już istnieje duplikat, pomijamy
                    continue
