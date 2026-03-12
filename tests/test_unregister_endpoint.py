from src import app as app_module


def test_unregister_removes_student_from_activity(client):
    # Arrange
    activity_name = "Chess Club"
    email = app_module.activities[activity_name]["participants"][0]
    endpoint = f"/activities/{activity_name}/unregister"
    initial_count = len(app_module.activities[activity_name]["participants"])

    # Act
    response = client.delete(endpoint, params={"email": email})

    # Assert
    assert response.status_code == 200
    assert response.json() == {"message": f"Unregistered {email} from {activity_name}"}
    assert email not in app_module.activities[activity_name]["participants"]
    assert len(app_module.activities[activity_name]["participants"]) == initial_count - 1


def test_unregister_returns_404_for_unknown_activity(client):
    # Arrange
    activity_name = "Unknown Club"
    email = "someone@mergington.edu"
    endpoint = f"/activities/{activity_name}/unregister"

    # Act
    response = client.delete(endpoint, params={"email": email})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_returns_404_for_non_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "not.registered@mergington.edu"
    endpoint = f"/activities/{activity_name}/unregister"
    assert email not in app_module.activities[activity_name]["participants"]

    # Act
    response = client.delete(endpoint, params={"email": email})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Student is not signed up for this activity"


def test_signup_then_unregister_round_trip(client):
    # Arrange
    activity_name = "Debate Team"
    email = "flow.student@mergington.edu"
    signup_endpoint = f"/activities/{activity_name}/signup"
    unregister_endpoint = f"/activities/{activity_name}/unregister"

    # Act
    signup_response = client.post(signup_endpoint, params={"email": email})
    unregister_response = client.delete(unregister_endpoint, params={"email": email})

    # Assert
    assert signup_response.status_code == 200
    assert unregister_response.status_code == 200
    assert email not in app_module.activities[activity_name]["participants"]