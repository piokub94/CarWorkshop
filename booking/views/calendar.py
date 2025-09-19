from datetime import timedelta, time
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from booking.models import TimeSlot

@api_view(['GET'])
def calendar_view(request):
    today = timezone.localdate()
    end_date = today + timedelta(days=90)

    slots = TimeSlot.objects.filter(date__range=(today, end_date))
    slots_dict = {(slot.date, slot.time): slot for slot in slots}

    result = []
    current_day = today

    while current_day <= end_date:
        day_slots = []
        for hour in range(9, 17):  # od 9:00 do 16:30 (ostatni slot)
            for minute in (0, 30):
                slot_time = time(hour, minute)
                slot_obj = slots_dict.get((current_day, slot_time))
                if slot_obj:
                    day_slots.append({
                        'id': slot_obj.id,
                        'time': slot_time.strftime('%H:%M'),
                        'available': not slot_obj.is_booked
                    })
                # Jeśli chcesz pominąć sloty bez wpisu w bazie, nic nie dodawaj
                # Ewentualnie może dodać puste/nieaktywne sloty, ale wtedy frontend musi to obsłużyć
        result.append({'date': current_day.isoformat(), 'slots': day_slots})
        current_day += timedelta(days=1)

    return Response(result)
