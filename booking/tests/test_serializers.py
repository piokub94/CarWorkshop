import pytest
from booking.factories import VehicleFactory, AppointmentFactory
from booking.serializers import VehicleSerializer, AppointmentSerializer

@pytest.mark.django_db
def test_vehicle_serializer_serializes_correctly():
    vehicle = VehicleFactory()
    serializer = VehicleSerializer(vehicle)
    data = serializer.data
    assert data['brand'] == vehicle.brand
    assert data['user'] == vehicle.user.id  # poprawione z owner na user


@pytest.mark.django_db
def test_appointment_serializer_serializes_correctly():
    appointment = AppointmentFactory()
    serializer = AppointmentSerializer(appointment)
    data = serializer.data
    assert data['user'] == appointment.user.id
    assert data['vehicle'] == appointment.vehicle.id
    assert data['slot'] == appointment.slot.id
