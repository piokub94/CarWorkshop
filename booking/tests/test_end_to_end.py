import pytest
from rest_framework.test import APIClient
from faker import Faker
from datetime import date, timedelta
from random import randint, choice
from django.contrib.auth.models import User

fake = Faker()

@pytest.mark.django_db
def test_end_to_end_booking_flow():
    client = APIClient()

    # 1. Rejestracja użytkownika
    username = fake.user_name()
    email = fake.email()
    password = fake.password()

    response = client.post("/api/register/", {
        "username": username,
        "email": email,
        "password": password
    }, format="json")
    assert response.status_code == 201

    # 2. Logowanie użytkownika
    response = client.post("/api/login/", {
        "username": username,
        "password": password
    }, format="json")
    assert response.status_code == 200
    assert "token" in response.data
    token = response.data["token"]

    # 3. Autoryzacja klienta
    client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    # 4. Dodanie pojazdu przez użytkownika
    response = client.post("/api/vehicles/", {
        "vin": fake.unique.bothify(text="?????????????????"),
        "brand": fake.company(),
        "model": fake.word(),
        "engine": f"{randint(1, 4)}.0L",
        "power": randint(60, 400),
        "transmission": choice(["MANUAL", "AUTO", "SEMI_AUTO"])
    }, format="json")
    assert response.status_code == 201
    vehicle_id = response.data["id"]

    # 5. Utworzenie użytkownika admina i uwierzytelnienie jako admin
    admin_user = User.objects.create_superuser(username='admin', email='admin@example.com', password='adminpass')
    client.force_authenticate(user=admin_user)

    # 6. Utworzenie TimeSlot jako admin
    timeslot_date = date.today() + timedelta(days=1)
    response = client.post("/api/admin/timeslots/", {
        "date": str(timeslot_date),
        "time": "10:00",
        "is_booked": False
    }, format="json")
    assert response.status_code == 201
    timeslot_id = response.data["id"]

    # 7. Powrót do autoryzacji jako zwykły użytkownik
    user = User.objects.get(username=username)
    client.force_authenticate(user=user)

    # 8. Rezerwacja wizyty (appointment)
    response = client.post("/api/appointments/", {
        "slot": timeslot_id,
        "vehicle": vehicle_id,
        "service_type": "PRZEGLAD",
        "description": fake.sentence()
    }, format="json")
    assert response.status_code == 201
