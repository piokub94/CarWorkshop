import factory
from factory.django import DjangoModelFactory
from django.contrib.auth.models import User
from datetime import date, time, timedelta
from random import randint, choice
from booking.models import TimeSlot, Vehicle, Appointment

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Faker("user_name")
    email = factory.Faker("email")
    password = factory.PostGenerationMethodCall("set_password", "testpass123")


class TimeSlotFactory(DjangoModelFactory):
    class Meta:
        model = TimeSlot

    date = factory.LazyFunction(lambda: date.today() + timedelta(days=randint(1, 30)))
    # Generujemy tylko pełne półgodzinne sloty w godzinach 9-16
    time = factory.LazyFunction(lambda: time(hour=randint(9, 16), minute=0 if randint(0,1) == 0 else 30))
    is_booked = False


class VehicleFactory(DjangoModelFactory):
    class Meta:
        model = Vehicle

    user = factory.SubFactory(UserFactory)
    vin = factory.Faker("bothify", text="?????????????????")
    brand = factory.Faker("company")
    model = factory.Faker("word")
    engine = factory.Faker("word")
    power = factory.Faker("random_int", min=70, max=400)
    transmission = factory.LazyFunction(lambda: choice([c[0] for c in Vehicle.TRANSMISSION_CHOICES]))


class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment

    user = factory.SubFactory(UserFactory)

    @factory.lazy_attribute
    def vehicle(self):
        return VehicleFactory(user=self.user)

    slot = factory.SubFactory(TimeSlotFactory)
    service_type = factory.LazyFunction(lambda: choice([c[0] for c in Appointment.SERVICE_CHOICES]))
    description = factory.Faker("sentence")
