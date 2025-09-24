from rest_framework.authentication import TokenAuthentication

class CsrfExemptTokenAuthentication(TokenAuthentication):
    """
    Nadpisuje enforce_csrf, żeby nie wymagało CSRF dla TokenAuthentication.
    Przydatne, gdy frontend używa tokenów w nagłówkach.
    """
    def enforce_csrf(self, request):
        return  # Nie weryfikujemy CSRF
