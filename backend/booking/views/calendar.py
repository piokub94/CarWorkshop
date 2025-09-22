from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny # Importuj uprawnienie AllowAny
from backend.booking.models import TimeSlot

@api_view(['GET'])
@permission_classes([AllowAny]) # Zezwól na dostęp niezalogowanym użytkownikom
def calendar_view(request):
    """
    Zwraca kalendarz z dostępnymi slotami na najbliższe 90 dni.
    """
    today = timezone.localdate()
    end_date = today + timedelta(days=90)

    slots = TimeSlot.objects.filter(
        date__range=(today, end_date),
        is_booked=False
    ).order_by('date', 'time')

    day_slots_map = {}
    for slot in slots:
        day_key = slot.date.isoformat()
        if day_key not in day_slots_map:
            day_slots_map[day_key] = []
        day_slots_map[day_key].append({
            'id': slot.id,
            'time': slot.time.strftime('%H:%M'),
            'available': True,
        })

    result = []
    for date_str, slot_list in day_slots_map.items():
        result.append({
            'date': date_str,
            'slots': slot_list,
        })

    result.sort(key=lambda x: x['date'])

    return Response(result)