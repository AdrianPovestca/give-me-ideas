"use strict";

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
    apiBaseUrl: "YOUR_BACKEND_URL",
    exitPrice: "$5.99"
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   YEAR
========================================================= */

const yearElement = $("#year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   IDEA FORM
========================================================= */

const ideaForm = $("#ideaForm");
const ideaInput = $("#idea");
const characterCount = $("#characterCount");

const formSuccess = $("#formSuccess");
const sendAnother = $("#sendAnother");


function updateCharacterCount() {
    if (!ideaInput || !characterCount) {
        return;
    }

    const length = ideaInput.value.length;

    characterCount.textContent = `${length} / 500`;
}


if (ideaInput) {
    ideaInput.addEventListener(
        "input",
        updateCharacterCount
    );
}


if (ideaForm) {

    ideaForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (!ideaInput) {
                return;
            }

            const idea = ideaInput.value.trim();

            if (!idea) {
                ideaInput.focus();
                return;
            }

            if (idea.length > 500) {
                return;
            }


            /* -------------------------------------------------
               BUTTON
            ------------------------------------------------- */

            const submitButton =
                ideaForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;
                submitButton.style.opacity = "0.6";
                submitButton.textContent = "Sending...";

            }


            /* -------------------------------------------------
               SEND TO BACKEND
            ------------------------------------------------- */

            try {

                const response = await fetch(
                    `${CONFIG.apiBaseUrl}/api/ideas`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            idea: idea
                        })
                    }
                );


                const data = await response.json();


                /* -------------------------------------------------
                   ERROR FROM BACKEND
                ------------------------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Could not send the idea."
                    );

                }


                /* -------------------------------------------------
                   SUCCESS
                ------------------------------------------------- */

                ideaForm.classList.add("hidden");

                if (formSuccess) {
                    formSuccess.classList.add("active");
                }


                ideaInput.value = "";

                updateCharacterCount();


            } catch (error) {

                console.error(
                    "Idea submission failed:",
                    error
                );


                alert(
                    "Something went wrong. Please try again."
                );


            } finally {

                /* -------------------------------------------------
                   RESET BUTTON
                ------------------------------------------------- */

                if (submitButton) {

                    submitButton.disabled = false;
                    submitButton.style.opacity = "";
                    submitButton.textContent = "Send idea";

                }

            }

        }
    );

}


if (sendAnother) {

    sendAnother.addEventListener(
        "click",
        () => {

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

            updateCharacterCount();

        }
    );

}


/* =========================================================
   EXIT APP MODAL
========================================================= */

const exitModal = $("#exitModal");

const exitButton = $("#exitButton");
const tryExit = $("#tryExit");
const buildExit = $("#buildExit");

const closeModalButton = $("#closeModal");
const stayButton = $("#stayButton");
const payButton = $("#payButton");


function openExitModal(event) {

    if (event) {
        event.preventDefault();
    }

    if (!exitModal) {
        return;
    }

    exitModal.classList.add("active");

    exitModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


function closeExitModal() {

    if (!exitModal) {
        return;
    }

    exitModal.classList.remove("active");

    exitModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


/* ---------------------------------------------------------
   OPEN MODAL
--------------------------------------------------------- */

if (exitButton) {

    exitButton.addEventListener(
        "click",
        openExitModal
    );

}


if (tryExit) {

    tryExit.addEventListener(
        "click",
        openExitModal
    );

}


if (buildExit) {

    buildExit.addEventListener(
        "click",
        openExitModal
    );

}


/* ---------------------------------------------------------
   CLOSE MODAL
--------------------------------------------------------- */

if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        closeExitModal
    );

}


if (stayButton) {

    stayButton.addEventListener(
        "click",
        closeExitModal
    );

}


/* =========================================================
   PAY BUTTON
========================================================= */

if (payButton) {

    payButton.addEventListener(
        "click",
        () => {

            /*
             * Payment is intentionally not connected yet.
             */

            alert(
                "Nice try. The $5.99 payment isn't connected yet."
            );

        }
    );

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OVERLAY
========================================================= */

if (exitModal) {

    exitModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target.classList.contains(
                    "modal-overlay"
                )
            ) {

                closeExitModal();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {
            closeExitModal();
        }

    }
);


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

const revealElements = $$(
    ".build-card, .featured-card, .idea-item"
);


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    revealElements.forEach((element) => {

        element.classList.add("reveal");

        revealObserver.observe(element);

    });


} else {

    revealElements.forEach((element) => {

        element.classList.add("reveal");
        element.classList.add("visible");

    });

}


/* =========================================================
   SMOOTH INTERNAL NAVIGATION
========================================================= */

$$('a[href^="#"]').forEach((link) => {

    link.addEventListener(
        "click",
        (event) => {

            const targetID =
                link.getAttribute("href");


            if (
                !targetID ||
                targetID === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetID);


            if (!target) {
                return;
            }


            /*
             * Don't interfere with exit buttons.
             */

            if (
                link.id === "tryExit" ||
                link.id === "buildExit"
            ) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

});


/* =========================================================
   INITIAL STATE
========================================================= */

updateCharacterCount();


if (exitModal) {

    exitModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "%cADRIAN BUILDS",
    "font-size: 20px; font-weight: 700;"
);

console.log(
    "%cI turn stupid ideas into real apps.",
    "font-size: 12px;"
);
