import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from booking.factories import UserFactory, VehicleFactory, TimeSlotFactory, AppointmentFactory
from booking.models import Appointment
from datetime import date as dt_date, timedelta



@pytest.mark.django_db
def test_appointment_list_view():
    user = UserFactory()
    AppointmentFactory.create_batch(3, user=user)
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse('user_appointments')
    response = client.get(url)
    assert response.status_code == 200
    assert all(app['user'] == user.id for app in response.data['results'])

@pytest.mark.django_db
def test_create_appointment_via_api():
    user = UserFactory()
    vehicle = VehicleFactory(user=user)
    slot = TimeSlotFactory(is_booked=False)
    client = APIClient()
    client.force_authenticate(user=user)

    url = reverse('create_appointment')
    data = {
        "vehicle": vehicle.id,
        "slot": slot.id,
        "service_type": "DIAGNOSTYKA",
        "description": "Sprawdzenie silnika"
    }
    response = client.post(url, data, format='json')
    assert response.status_code == 201
    assert Appointment.objects.count() == 1



@pytest.mark.django_db
def test_timeslot_availability_on_weekday():
    user = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user)

    day = dt_date.today()
    while day.weekday() >= 5:  # pomiń weekendy
        day += timedelta(days=1)

    slot = TimeSlotFactory(date=day, is_booked=False)
    slot.refresh_from_db()

    url = reverse("calendar")
    response = client.get(url)
    assert response.status_code == 200
    data = response.data

    available_dates = [day['date'] for day in data]
    assert str(slot.date) in available_dates, f"Data slotu {slot.date} nie jest w response: {available_dates}"

    slot_found = any(
        day['date'] == str(slot.date) and
        any(s['time'] == slot.time.strftime("%H:%M") and s['available'] for s in day['slots'])
        for day in data
    )
    assert slot_found