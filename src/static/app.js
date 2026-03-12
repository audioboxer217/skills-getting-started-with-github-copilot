document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function buildActivityDetail(label, value) {
    const detail = document.createElement("p");
    detail.className = "activity-detail";

    const detailLabel = document.createElement("strong");
    detailLabel.textContent = `${label}: `;
    detail.appendChild(detailLabel);
    detail.append(value);

    return detail;
  }

  async function unregisterParticipant(activityName, participantEmail) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to unregister participant");
      }

      showMessage(result.message, "success");
      await fetchActivities(activityName);
    } catch (error) {
      showMessage(error.message || "Failed to unregister participant", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  function buildParticipantsSection(activityName, participants) {
    const participantsSection = document.createElement("div");
    participantsSection.className = "participants-section";

    const participantsHeader = document.createElement("div");
    participantsHeader.className = "participants-header";

    const participantsTitle = document.createElement("h5");
    participantsTitle.textContent = "Participants";

    const participantsCount = document.createElement("span");
    participantsCount.className = "participants-count";
    participantsCount.textContent = `${participants.length} signed up`;

    participantsHeader.append(participantsTitle, participantsCount);
    participantsSection.appendChild(participantsHeader);

    if (participants.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "participants-empty";
      emptyState.textContent = "No participants yet.";
      participantsSection.appendChild(emptyState);
      return participantsSection;
    }

    const participantsList = document.createElement("ul");
    participantsList.className = "participants-list";

    participants.forEach((participant) => {
      const participantItem = document.createElement("li");
      participantItem.className = "participant-item";

      const participantEmail = document.createElement("span");
      participantEmail.className = "participant-email";
      participantEmail.textContent = participant;

      const unregisterButton = document.createElement("button");
      unregisterButton.type = "button";
      unregisterButton.className = "participant-remove-button";
      unregisterButton.setAttribute("aria-label", `Unregister ${participant} from ${activityName}`);
      unregisterButton.innerHTML =
        '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h2v9H7V9Zm4 0h2v9h-2V9Zm4 0h2v9h-2V9Z"/></svg>';
      unregisterButton.addEventListener("click", () => {
        unregisterParticipant(activityName, participant);
      });

      participantItem.append(participantEmail, unregisterButton);
      participantsList.appendChild(participantItem);
    });

    participantsSection.appendChild(participantsList);
    return participantsSection;
  }

  function buildActivityCard(name, details) {
    const activityCard = document.createElement("article");
    activityCard.className = "activity-card";

    const title = document.createElement("h4");
    title.textContent = name;

    const description = document.createElement("p");
    description.className = "activity-description";
    description.textContent = details.description;

    const spotsLeft = details.max_participants - details.participants.length;
    const activityMeta = document.createElement("div");
    activityMeta.className = "activity-meta";
    activityMeta.append(
      buildActivityDetail("Schedule", details.schedule),
      buildActivityDetail("Availability", `${spotsLeft} spots left`)
    );

    activityCard.append(title, description, activityMeta, buildParticipantsSection(name, details.participants));
    return activityCard;
  }

  function resetActivityOptions(selectedActivity = "") {
    activitySelect.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "-- Select an activity --";
    activitySelect.appendChild(placeholderOption);

    return selectedActivity;
  }

  // Function to fetch activities from API
  async function fetchActivities(selectedActivity = activitySelect.value) {
    try {
      const response = await fetch(`/activities?_=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      const activeSelection = resetActivityOptions(selectedActivity);

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        activitiesList.appendChild(buildActivityCard(name, details));

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.selected = name === activeSelection;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      resetActivityOptions();
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        const selectedActivity = activity;
        signupForm.reset();
        await fetchActivities(selectedActivity);
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
