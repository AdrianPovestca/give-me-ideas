/* =========================================
   YEAR
========================================= */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================================
   IDEA FORM
========================================= */

const ideaForm = document.getElementById("ideaForm");
const ideaInput = document.getElementById("idea");
const characterCount = document.getElementById("characterCount");

const formSuccess = document.getElementById("formSuccess");
const sendAnother = document.getElementById("sendAnother");


if (ideaInput && characterCount) {

    ideaInput.addEventListener("input", () => {

        const length = ideaInput.value.length;

        characterCount.textContent = `${length} / 500`;

    });

}


if (ideaForm) {

    ideaForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const idea = ideaInput.value.trim();

        if (!idea) {
            return;
        }


        /*
         * STATIC VERSION
         *
         * For now the idea is prepared as an email.
         *
         * Later we can replace this with:
         *
         * Supabase
         * Firebase
         * Formspree
         * Resend
         * Your own FastAPI endpoint
         */

        const subject =
            encodeURIComponent(
                "New app idea from Adrian Builds"
            );

        const body =
            encodeURIComponent(
                `New idea:\n\n${idea}\n\nSent from adrian-builds website.`
            );


        const mailto =
            `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;


        window.location.href = mailto;


        /*
         * Show success state after opening email client.
         */

        ideaForm.classList.add("hidden");

        formSuccess.classList.add("active");

    });

}


if (sendAnother) {

    sendAnother.addEventListener("click", () => {

        formSuccess.classList.remove("active");

        ideaForm.classList.remove("hidden");

        ideaInput.value = "";

        characterCount.textContent = "0 / 500";

        ideaInput.focus();

    });

}


/* =========================================
   EXIT APP
========================================= */

const exitModal = document.getElementById("exitModal");

const exitButton = document.getElementById("exitButton");
const tryExit = document.getElementById("tryExit");
const buildExit = document.getElementById("buildExit");

const closeModal = document.getElementById("closeModal");
const stayButton = document.getElementById("stayButton");
const payButton = document.getElementById("payButton");


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


if (closeModal) {
    closeModal.addEventListener(
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


if (payButton) {

    payButton.addEventListener(
        "click",
        () => {

            /*
             * This is intentionally not connected
             * to a real payment system.
             *
             * Later:
             * Stripe Checkout / Lemon Squeezy
             * can be connected here.
             */

            alert(
                "Nice try. The $5.99 payment isn't connected yet."
            );

        }
    );

}


/* =========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================= */

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


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeExitModal();

        }

    }
);


/* =========================================
   SMALL REVEAL ANIMATION
========================================= */

const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: 0.12
        }
    );


document
    .querySelectorAll(
        ".build-card, .featured-card, .idea-item"
    )
    .forEach((element) => {

        element.classList.add("reveal");

        observer.observe(element);

    });
