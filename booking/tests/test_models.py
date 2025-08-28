import pytest
from booking.models import User, Vehicle, TimeSlot, Appointment
from booking.factories import UserFactory, VehicleFactory, TimeSlotFactory, AppointmentFactory

@pytest.mark.django_db
def test_create_user():
    user = UserFactory()
    assert isinstance(user, User)
    assert user.username is not None
    assert user.email is not None

@pytest.mark.django_db
def test_create_vehicle():
    vehicle = VehicleFactory()
    assert isinstance(vehicle, Vehicle)
    assert vehicle.user is not None
    assert vehicle.transmission in ['MANUAL', 'AUTO', 'SEMI_AUTO']

@pytest.mark.django_db
def test_create_timeslot():
    slot = TimeSlotFactory()
    assert isinstance(slot, TimeSlot)
    assert 9 <= slot.time.hour <= 16
    assert slot.is_booked is False

@pytest.mark.django_db
def test_create_appointment():
    appointment = AppointmentFactory()
    assert isinstance(appointment, Appointment)
    assert appointment.user is not None
    assert appointment.slot is not None
    assert appointment.vehicle.user == appointment.user
    assert appointment.service_type in [choice[0] for choice in Appointment.SERVICE_CHOICES]
