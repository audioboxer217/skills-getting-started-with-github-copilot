from src import app as app_module


def test_get_activities_returns_all_configured_activities(client):
    # Arrange
    endpoint = "/activities"
    expected_activity_names = set(app_module.activities.keys())

    # Act
    response = client.get(endpoint)

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, dict)
    assert set(payload.keys()) == expected_activity_names


def test_get_activities_returns_required_fields_per_activity(client):
    # Arrange
    endpoint = "/activities"
    required_fields = {"description", "schedule", "max_participants", "participants"}

    # Act
    response = client.get(endpoint)

    # Assert
    assert response.status_code == 200
    payload = response.json()
    for activity_data in payload.values():
        assert required_fields.issubset(activity_data.keys())
        assert isinstance(activity_data["participants"], list)


def test_get_activities_sets_no_cache_headers(client):
    # Arrange
    endpoint = "/activities"

    # Act
    response = client.get(endpoint)

    # Assert
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "no-store, no-cache, must-revalidate"
    assert response.headers["Pragma"] == "no-cache"
    assert response.headers["Expires"] == "0"