# from django.apps import AppConfig
# from django.utils.timezone import now
# from datetime import datetime, timedelta, time
#
#
# class BookingConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'booking'
#
#     def ready(self):
#         from booking.models import TimeSlot
#         today = now().date()
#         start_hour, end_hour = 9, 17
#
#         for i in range(30):  # 30 dni do przodu
#             day = today + timedelta(days=i)
#             if day.weekday() < 5:  # tylko pon-pt
#                 current_time = time(hour=start_hour, minute=0)
#                 while current_time < time(hour=end_hour, minute=0):
#                     TimeSlot.objects.get_or_create(date=day, time=current_time)
#                     # krok co 30 minut
#                     dt = datetime.combine(day, current_time) + timedelta(minutes=30)
#                     current_time = dt.time()
