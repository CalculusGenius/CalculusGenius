// =========================================
// CALCULUS — CHAT PAGE
// =========================================

import {
    watchAuthState
} from "./auth.js";


// =========================================
// ELEMENTS
// =========================================

const chatLoginNotice =
    document.getElementById(
        "chatLoginNotice"
    );

const messageComposer =
    document.getElementById(
        "messageComposer"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const emojiButton =
    document.getElementById(
        "emojiButton"
    );


// =========================================
// AUTHENTICATION STATE
// =========================================

watchAuthState(
    (user) => {

        // =====================================
        // USER IS LOGGED IN
        // =====================================

        if (user) {

            /*
               Hide the login notice.
            */

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "none";

            }


            /*
               Enable the message composer.
            */

            if (messageInput) {

                messageInput.disabled =
                    false;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    false;

            }

        }


        // =====================================
        // USER IS LOGGED OUT
        // =====================================

        else {

            /*
               Show the login notice.
            */

            if (chatLoginNotice) {

                chatLoginNotice.style.display =
                    "block";

            }


            /*
               Disable the message composer.
            */

            if (messageInput) {

                messageInput.disabled =
                    true;

            }


            if (emojiButton) {

                emojiButton.disabled =
                    true;

            }

        }

    }
);


// =========================================
// MESSAGE COMPOSER
// =========================================

if (messageComposer) {

    messageComposer.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /*
               Actual message sending will be
               implemented when we connect the
               chat system to Firebase.
            */

            const message =
                messageInput
                    ? messageInput.value.trim()
                    : "";


            if (!message) {

                return;

            }


            /*
               For now, do nothing with the
               message.

               Firebase message storage will
               be added in the next stage.
            */

            console.log(
                "Message ready:",
                message
            );


            if (messageInput) {

                messageInput.value = "";

            }

        }
    );

}


// =========================================
// EMOJI BUTTON
// =========================================

if (emojiButton) {

    emojiButton.addEventListener(
        "click",
        () => {

            /*
               Emoji picker functionality will
               be added in the next stage.
            */

            console.log(
                "Emoji button clicked."
            );

        }
    );

}
