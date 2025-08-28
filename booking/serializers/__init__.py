from .appointment import AppointmentSerializer
from .timeslot import TimeSlotSerializer
from .vehicle import VehicleSerializer
from .user import UserSerializer, RegisterSerializer
from .profile import ProfileSerializer

__all__ = [
    'AppointmentSerializer',
    'TimeSlotSerializer',
    'VehicleSerializer',
    'UserSerializer',
    'RegisterSerializer',
    'ProfileSerializer',
]
