// =========================================
// CALCULUS — CHAT MEDIA
// =========================================
// Separate media feature module
// =========================================

import {
    requestGoogleDriveAccess
} from "./google-drive.js";


// =========================================
// STATE
// =========================================

let selectedFile = null;


// =========================================
// GET CURRENT CONVERSATION
// =========================================

function getConversationId() {

    if (
        !window.calculusChat ||
        !window.calculusChat.getConversationId
    ) {

        return null;

    }

    return window.calculusChat
        .getConversationId();

}


// =========================================
// GET CURRENT USER
// =========================================

function getCurrentUser() {

    if (
        !window.calculusChat ||
        !window.calculusChat.getCurrentUser
    ) {

        return null;

    }

    return window.calculusChat
        .getCurrentUser();

}


// =========================================
// CREATE MEDIA BUTTON
// =========================================

function createMediaButton() {

    const composer =
        document.getElementById(
            "messageComposer"
        );

    if (!composer) {

        console.error(
            "Message composer not found."
        );

        return;

    }


    if (
        document.getElementById(
            "chatMediaButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.id =
        "chatMediaButton";

    button.className =
        "emoji-button";

    button.textContent =
        "📎";

    button.title =
        "Attach file";

    button.setAttribute(
        "aria-label",
        "Attach file"
    );


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";

    input.id =
        "chatMediaInput";

    input.accept =
        "image/*,video/*,.pdf,.doc,.docx,.txt";

    input.style.display =
        "none";


    button.addEventListener(
        "click",
        () => {

            input.click();

        }
    );


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files &&
                input.files[0];


            if (!file) {

                return;

            }


            selectedFile =
                file;


            console.log(
                "Selected media:",
                file.name,
                file.type,
                file.size
            );


            uploadSelectedFile();

        }
    );


    composer.insertBefore(
        button,
        composer.firstChild
    );


    composer.appendChild(
        input
    );


    console.log(
        "CALCULUS media button ready."
    );

}


// =========================================
// UPLOAD SELECTED FILE
// =========================================

async function uploadSelectedFile() {

    const file =
        selectedFile;


    if (!file) {

        return;

    }


    const conversationId =
        getConversationId();


    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "Please sign in first."
        );

        return;

    }


    if (!conversationId) {

        alert(
            "Please select a conversation first."
        );

        return;

    }


    try {

        console.log(
            "Requesting Google Drive access..."
        );


        const accessToken =
            await requestGoogleDriveAccess();


        console.log(
            "Drive access granted."
        );


        /*
           Upload implementation comes next.
        */

        console.log(
            "Ready to upload:",
            file.name
        );


        alert(
            "Google Drive access is ready for " +
            file.name
        );

    }

    catch (error) {

        console.error(
            "Media upload preparation failed:",
            error
        );


        alert(
            "Could not prepare the file upload."
        );

    }

    finally {

        selectedFile =
            null;

    }

}


// =========================================
// INITIALIZE
// =========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        createMediaButton
    );

}

else {

    createMediaButton();

}


console.log(
    "CALCULUS Chat Media module loaded."
);
