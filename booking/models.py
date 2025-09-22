from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField

from booking.utils.sms import send_sms


class TimeSlot(models.Model):
    date = models.DateField()
    time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} {self.time.strftime('%H:%M')}"


class Vehicle(models.Model):
    TRANSMISSION_CHOICES = [
        ('MANUAL', 'Manualna'),
        ('AUTO', 'Automatyczna'),
        ('SEMI_AUTO', 'Półautomatyczna'),
    ]

    FUEL_CHOICES = [
        ('PETROL', 'Benzyna'),
        ('DIESEL', 'Diesel'),
        ('LPG', 'LPG'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    vin = models.CharField(max_length=17, unique=True)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    engine = models.CharField(max_length=50)
    power = models.PositiveIntegerField(help_text="KM")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.vin})"


class Appointment(models.Model):
    SERVICE_CHOICES = [
        ('PRZEGLAD', 'Przegląd okresowy'),
        ('HAMULCE', 'Wymiana hamulców'),
        ('DIAGNOSTYKA', 'Diagnostyka'),
        ('INNE', 'Inne'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone_number = PhoneNumberField(blank=True, null=True)
    slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, null=True, blank=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='PRZEGLAD')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.slot} - {self.get_service_type_display()}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = PhoneNumberField(blank=True, null=True)

    def __str__(self):
        return f"Profil użytkownika {self.user.username}"


# --- Signals (po definicjach modeli) ---

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    # Tworzymy profil przy rejestracji; przy aktualizacji dbamy, by istniał
    if created:
        Profile.objects.create(user=instance)
    else:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=Appointment)
def appointment_created_sms(sender, instance, created, **kwargs):
    """Wyślij SMS po utworzeniu wizyty; użyj numeru z wizyty lub z profilu."""
    if created:
        phone_number = instance.phone_number or getattr(getattr(instance.user, "profile", None), "phone_number", None)
        if phone_number:
            message = (
                f"Twoja rezerwacja w warsztacie została potwierdzona "
                f"na {instance.slot.date} o {instance.slot.time.strftime('%H:%M')}."
            )
            send_sms(phone_number, message)
