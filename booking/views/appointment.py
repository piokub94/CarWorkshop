from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from booking.models import Appointment, TimeSlot
from booking.serializers.appointment import AppointmentSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 100


class CreateAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            appointment = serializer.save(user=request.user)

            # blokuj wybrany slot + 2 następne (łącznie 1,5h)
            slot = appointment.slot
            dt_start = datetime.combine(slot.date, slot.time)
            slot.is_booked = True
            slot.save()

            for i in range(1, 3):
                dt_next = dt_start + timedelta(minutes=30 * i)
                try:
                    next_slot = TimeSlot.objects.get(date=dt_next.date(), time=dt_next.time())
                    next_slot.is_booked = True
                    next_slot.save()
                except TimeSlot.DoesNotExist:
                    pass

            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sort_by = request.query_params.get('sort', 'slot__date')
        direction = request.query_params.get('direction', 'asc')
        if direction == 'desc':
            sort_by = f'-{sort_by}'
        appointments = Appointment.objects.filter(user=request.user).order_by(sort_by)
        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(appointments, request)
        serializer = AppointmentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminAppointmentsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sort_by = request.query_params.get('sort', 'slot__date')
        direction = request.query_params.get('direction', 'asc')
        if direction == 'desc':
            sort_by = f'-{sort_by}'
        appointments = Appointment.objects.all().order_by(sort_by)
        paginator = StandardResultsSetPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(appointments, request)
        serializer = AppointmentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Appointment, pk=pk, user=user)

    def put(self, request, pk):
        appt = self.get_object(pk, request.user)
        data = request.data.copy()
        data.pop('slot', None)
        data.pop('user', None)
        serializer = AppointmentSerializer(appt, data=data, partial=False, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        appt = self.get_object(pk, request.user)
        data = request.data.copy()
        data.pop('slot', None)
        data.pop('user', None)
        serializer = AppointmentSerializer(appt, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        appt = self.get_object(pk, request.user)
        slot = appt.slot
        slot.is_booked = False
        slot.save()
        appt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
