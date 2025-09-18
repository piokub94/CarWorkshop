from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from booking.views.appointment import (
    CreateAppointmentView,
    UserAppointmentsView,
    AdminAppointmentsView,
    AppointmentDetailView,
)
from booking.views.vehicle import VehicleListCreateView, VehicleDetailView
from booking.views.timeslot import TimeSlotListCreateView, TimeSlotDetailView
from booking.views.user import register_view, profile_view
from booking.views.calendar import calendar_view

urlpatterns = [
    # Auth
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('register/', register_view, name='register'),

    # Profile
    path('profile/', profile_view, name='profile'),

    # Calendar
    path('calendar/', calendar_view, name='calendar'),

    # Appointments
    path('appointments/', CreateAppointmentView.as_view(), name='create_appointment'),
    path('appointments/list/', UserAppointmentsView.as_view(), name='user_appointments'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),

    # Vehicles
    path('vehicles/', VehicleListCreateView.as_view(), name='vehicle_list_create'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle_detail'),

    # TimeSlots (admin)
    path('admin/timeslots/', TimeSlotListCreateView.as_view(), name='timeslot_list_create'),
    path('admin/timeslots/<int:pk>/', TimeSlotDetailView.as_view(), name='timeslot_detail'),
]
