import pytest
from booking.factories import UserFactory, AppointmentFactory, TimeSlotFactory

@pytest.mark.django_db
def test_appointment_without_vehicle_is_allowed():
    # Vehicle jest nullable zgodnie z modelem, nie oczekujemy wyjątku
    user = UserFactory()
    slot = TimeSlotFactory()
    appointment = AppointmentFactory(user=user, vehicle=None, slot=slot)
    assert appointment.vehicle is None

@pytest.mark.django_db
def test_appointment_double_slot_not_allowed():
    user = UserFactory()
    slot = TimeSlotFactory()
    AppointmentFactory(user=user, slot=slot)
    # Slot jest OneToOne dla Appointment. Druga próba powinna wyrzucić wyjątek
    with pytest.raises(Exception):
        AppointmentFactory(user=user, slot=slot)
