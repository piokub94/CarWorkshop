import pytest
from booking.factories import UserFactory

@pytest.mark.django_db
def test_user_creation_and_fields():
    user = UserFactory()
    assert user.username is not None
    assert user.email is not None
