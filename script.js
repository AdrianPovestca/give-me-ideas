
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const CONFIG = {
  apiBaseUrl: ""
};

/* YEAR */

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* IDEA FORM */

const ideaForm = $("#ideaForm");
const ideaInput = $("#idea");
const characterCount = $("#characterCount");
const submitButton = $("#submitIdea");
const formError = $("#formError");
const formSuccess = $("#formSuccess");
const sendAnother = $("#sendAnother");

function updateCharacterCount() {
  if (!ideaInput || !characterCount) return;

  const length = ideaInput.value.length;
  characterCount.textContent = `${length} / 500`;
}

function showError(message) {
  if (formError) {
    formError.textContent = message;
  }
}

function clearError() {
  if (formError) {
    formError.textContent = "";
  }
}

if (ideaInput) {
  ideaInput.addEventListener("input", () => {
    updateCharacterCount();
    clearError();
  });
}

if (ideaForm) {
  ideaForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ideaInput || !submitButton) return;

    const idea = ideaInput.value.trim();

    clearError();

    if (!idea) {
      showError("Write your idea before sending it.");
      ideaInput.focus();
      return;
    }

    if (idea.length > 500) {
      showError("Your idea must be 500 characters or less.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(
        `${CONFIG.apiBaseUrl}/api/ideas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ idea })
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message ||
          data.detail ||
          "Could not send your idea. Please try again."
        );
      }

      ideaForm.classList.add("hidden");

      if (formSuccess) {
        formSuccess.classList.add("active");
      }

      ideaInput.value = "";
      updateCharacterCount();

    } catch (error) {
      console.error("Idea submission failed:", error);

      showError(
        error.message ||
        "Something went wrong. Please try again."
      );

    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send idea <span>↗</span>';
    }
  });
}

/* SEND ANOTHER IDEA */

if (sendAnother) {
  sendAnother.addEventListener("click", () => {
    if (formSuccess) {
      formSuccess.classList.remove("active");
    }

    if (ideaForm) {
      ideaForm.classList.remove("hidden");
    }

    if (ideaInput) {
      ideaInput.value = "";
      ideaInput.focus();
    }

    clearError();
    updateCharacterCount();
  });
}

/* REVEAL ANIMATIONS */

const revealElements = $$(".build-card, .idea-item");

if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("reveal", "visible");
  });
}

/* SMOOTH NAVIGATION */

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetID = link.getAttribute("href");

    if (!targetID || targetID === "#") {
      if (targetID === "#") {
        event.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }

      return;
    }

    const target = document.querySelector(targetID);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    history.replaceState(null, "", targetID);
  });
});

/* INITIAL STATE */

updateCharacterCount();

console.log(
  "%cADRIAN BUILDS",
  "font-size: 20px; font-weight: 700;"
);

console.log(
  "%cI turn stupid ideas into real apps.",
  "font-size: 12px;"
);
