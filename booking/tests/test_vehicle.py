import pytest
from booking.factories import VehicleFactory

@pytest.mark.django_db
def test_vehicle_creation_and_fields():
    vehicle = VehicleFactory()
    assert vehicle.brand is not None
    assert vehicle.model is not None
    assert vehicle.user is not None
