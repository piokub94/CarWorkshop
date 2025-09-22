from django.contrib import admin
from .models import TimeSlot, Appointment, Vehicle, Profile

admin.site.register(TimeSlot)
admin.site.register(Appointment)
admin.site.register(Vehicle)
admin.site.register(Profile)
